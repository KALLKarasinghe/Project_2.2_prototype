import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SystemContext = createContext();

// ─── API Base URL ───────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/pharma_backend/api';

export const useSystemStore = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemStore must be used within a SystemProvider');
  }
  return context;
};

// ─── Helper: generic fetch wrapper ───────────────────────
async function api(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const SystemProvider = ({ children }) => {
  // ─── State ──────────────────────────────────────────────
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [specialMedicines, setSpecialMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Cart State (Database-backed) ────────────────────────
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Derived cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Fetch helpers (wrapped in useCallback) ─────────────
  const fetchMedicines = useCallback(async () => {
    try {
      const res = await api('products.php');
      const items = res.data || res;
      // Backend now returns columns aliased to match frontend expectations
      const mapped = (Array.isArray(items) ? items : []).map(med => ({
        id: med.id,
        company_id: med.company_id,
        brand: med.brand,
        name: med.name,
        description: med.description,
        price: med.price,
        expireDate: med.expireDate,
        stock: med.stock,
        company_name: med.company_name
      }));
      setMedicines(mapped);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id) {
      setOrders([]);
      return;
    }
    
    // Prevent invalid API calls for Admins or other roles
    const role = currentUser.role.toLowerCase();
    if (role !== 'pharmacy' && role !== 'supplier' && role !== 'company') {
      setOrders([]);
      return;
    }
    
    try {
      const data = await api(`orders.php?role=${role}&user_id=${currentUser.id}`);
      if (data.success) {
        setOrders(data.data);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, [currentUser]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api('users.php?status=Active');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchPendingUsers = useCallback(async () => {
    try {
      const data = await api('users.php?status=Pending');
      setPendingUsers(data);
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
    }
  }, []);

  const fetchSpecialMedicines = useCallback(async () => {
    try {
      const data = await api('special_medicines.php');
      setSpecialMedicines(data);
    } catch (err) {
      console.error('Failed to fetch special medicines:', err);
    }
  }, []);

  // ─── Fetch Cart from Database ───────────────────────────
  const fetchCart = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('🛒 fetchCart: No user, clearing cart.');
      setCart([]);
      return;
    }
    console.log('🛒 fetchCart: Fetching cart for user_id =', currentUser.id);
    try {
      const response = await fetch(`${API_BASE}/cart.php?user_id=${currentUser.id}`);
      const text = await response.text();
      console.log('🛒 fetchCart raw response:', text);
      
      const res = JSON.parse(text);
      if (res.success && Array.isArray(res.data)) {
        // Map DB cart items to the shape React components expect
        const mapped = res.data.map(item => ({
          id: item.medicine_id,
          cart_id: item.cart_id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          stock: item.stock,
          company_id: item.company_id,
          company_name: item.company_name,
          quantity: item.quantity,
        }));
        console.log('🛒 fetchCart: Loaded', mapped.length, 'items');
        setCart(mapped);
      } else {
        console.warn('🛒 fetchCart: Unexpected response', res);
      }
    } catch (err) {
      console.error('🛒 fetchCart error:', err);
    }
  }, [currentUser]);

  // ─── Reload cart whenever user changes (login / logout) ──
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ─── Load all data on mount ─────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await Promise.all([
        fetchMedicines(),
        fetchOrders(),
        fetchUsers(),
        fetchPendingUsers(),
        fetchSpecialMedicines(),
        fetchCart(),
      ]);
      setLoading(false);
    }
    loadAll();
  }, [fetchMedicines, fetchOrders, fetchUsers, fetchPendingUsers, fetchSpecialMedicines, fetchCart]);

  // ─── Persist currentUser session in localStorage ────────
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // ─── Auth ───────────────────────────────────────────────
  const loginUser = async (credentials) => {
    const data = await api('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.success) {
      setCurrentUser(data.user);
    }
    return data;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
  };

  // ─── Orders ─────────────────────────────────────────────
  const placeOrder = async (orderPayload) => {
    // orderPayload: { pharmacy_id, company_id, total_amount, cart_items }
    try {
      const res = await api('orders.php', {
        method: 'POST',
        body: JSON.stringify({
          ...orderPayload,
          role: currentUser?.role
        }),
      });
      await fetchOrders(); // refresh from DB
      await fetchMedicines(); // stock changed
      return res;
    } catch (err) {
      console.error('Failed to place order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api('orders.php', {
        method: 'PUT',
        body: JSON.stringify({ 
          order_id: orderId, 
          status: newStatus, 
          role: currentUser.role 
        }),
      });
      await Promise.all([fetchOrders(), fetchMedicines()]); 
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const approveOrder = async (orderId) => {
    await updateOrderStatus(orderId, 'confirmed');
  };

  // ─── Users ──────────────────────────────────────────────
  const registerUser = async (userData) => {
    const isFormData = userData instanceof FormData;
    const data = await api('auth.php?action=register', {
      method: 'POST',
      body: isFormData ? userData : JSON.stringify(userData),
      ...(isFormData ? { headers: {} } : {})
    });
    await fetchPendingUsers();
    return data;
  };

  const approveUser = async (userId) => {
    try {
      await api('users.php', {
        method: 'PUT',
        body: JSON.stringify({ id: userId, status: 'Active' }),
      });
      await Promise.all([fetchUsers(), fetchPendingUsers()]);
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api(`users.php?id=${userId}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // ─── Medicines ──────────────────────────────────────────
  const addMedicine = async (medicineData) => {
    try {
      await api('products.php', {
        method: 'POST',
        body: JSON.stringify(medicineData),
      });
      await fetchMedicines();
    } catch (err) {
      console.error('Failed to add medicine:', err);
    }
  };

  // ─── Special Medicines ─────────────────────────────────
  const addSpecialMedicine = async (medicineData) => {
    try {
      await api('special_medicines.php', {
        method: 'POST',
        body: JSON.stringify(medicineData),
      });
      await fetchSpecialMedicines();
    } catch (err) {
      console.error('Failed to add special medicine:', err);
    }
  };

  // ─── Cart Functions (Database-backed) ───────────────────
  const addToCart = async (medicine, quantity = 1) => {
    if (!currentUser?.id) {
      console.warn('addToCart: No logged-in user. currentUser =', currentUser);
      return;
    }
    const payload = {
      user_id: Number(currentUser.id),
      medicine_id: Number(medicine.id),
      quantity: Number(quantity),
    };
    console.log('🛒 addToCart payload:', JSON.stringify(payload));
    try {
      const response = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await response.text(); // Get raw text first
      console.log('🛒 Cart API raw response:', text, '| Status:', response.status);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('🛒 JSON parse error. Raw response was:', text);
        return;
      }
      
      if (data.success) {
        console.log('✅ Cart item saved:', data);
        await fetchCart(); // Refresh from DB
      } else {
        console.error('❌ Cart API returned error:', data.error);
      }
    } catch (err) {
      console.error('❌ Network/fetch error in addToCart:', err);
    }
  };

  const removeFromCart = async (medicineId) => {
    if (!currentUser?.id) return;
    try {
      await fetch(`${API_BASE}/cart.php?user_id=${currentUser.id}&medicine_id=${medicineId}`, { method: 'DELETE' });
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const updateCartQty = async (medicineId, newQty) => {
    if (!currentUser?.id) return;
    if (newQty <= 0) {
      await removeFromCart(medicineId);
      return;
    }
    try {
      await api('cart.php', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: currentUser.id,
          medicine_id: medicineId,
          quantity: newQty,
        }),
      });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update cart qty:', err);
    }
  };

  const clearCart = async () => {
    if (!currentUser?.id) return;
    try {
      await fetch(`${API_BASE}/cart.php?user_id=${currentUser.id}&clear_all=true`, { method: 'DELETE' });
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const toggleCart = () => setIsCartOpen(prev => !prev);

  // ─── Context Value ─────────────────────────────────────
  const value = {
    medicines,
    specialMedicines,
    orders,
    users,
    pendingUsers,
    loading,
    placeOrder,
    updateOrderStatus,
    approveOrder,
    registerUser,
    approveUser,
    deleteUser,
    addMedicine,
    addSpecialMedicine,
    currentUser,
    loginUser,
    logoutUser,
    // Cart
    cart,
    cartTotal,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    toggleCart,
    // Expose refresh functions if dashboards need manual refresh
    refreshMedicines: fetchMedicines,
    refreshOrders: fetchOrders,
    refreshUsers: fetchUsers,
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};
