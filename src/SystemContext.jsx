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

  // ─── Cart State ─────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
      const data = await api('medicines.php');
      setMedicines(data);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api('orders.php');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

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
      ]);
      setLoading(false);
    }
    loadAll();
  }, [fetchMedicines, fetchOrders, fetchUsers, fetchPendingUsers, fetchSpecialMedicines]);

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
    // credentials: { name, password } for Admin or { email, password } for others
    const data = await api('auth.php', {
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
    localStorage.removeItem('currentUser');
  };

  // ─── Orders ─────────────────────────────────────────────
  const placeOrder = async (medicine, quantity) => {
    try {
      await api('orders.php', {
        method: 'POST',
        body: JSON.stringify({
          medicineId: medicine.id,
          pharmacyId: currentUser?.id || null,
          quantity: quantity,
        }),
      });
      await fetchOrders(); // refresh from DB
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  const approveOrder = async (orderId) => {
    try {
      await api('orders.php', {
        method: 'PUT',
        body: JSON.stringify({ id: orderId, status: 'Approved' }),
      });
      await Promise.all([fetchOrders(), fetchMedicines()]); // stock changed too
    } catch (err) {
      console.error('Failed to approve order:', err);
    }
  };

  // ─── Users ──────────────────────────────────────────────
  const registerUser = async (userData) => {
    try {
      await api('users.php', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      await fetchPendingUsers();
    } catch (err) {
      console.error('Failed to register user:', err);
    }
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
      await api('medicines.php', {
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

  // ─── Cart Functions ─────────────────────────────────────
  const addToCart = (medicine, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: medicine.id,
        name: medicine.name,
        brand: medicine.brand,
        price: parseFloat(medicine.price) || 0,
        quantity,
      }];
    });
  };

  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item.id !== medicineId));
  };

  const updateCartQty = (medicineId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === medicineId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
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
