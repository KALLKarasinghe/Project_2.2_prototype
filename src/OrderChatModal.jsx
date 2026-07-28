import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const OrderChatModal = ({ isOpen, onClose, order, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // figure out who we are talking to
  let otherPartyName = '';
  if (currentUser?.role === 'pharmacy') {
    otherPartyName = order?.company_name;
  } else {
    otherPartyName = order?.pharmacy_name;
  }

  const fetchMessages = async () => {
    if (!order?.id) return;
    try {
      const response = await fetch(`http://localhost/pharma_backend/api/order_chat.php?order_id=${order.id}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (isOpen && order) {
      fetchMessages();
      setIsLoading(true);
      // Simulate loading for better UX
      setTimeout(() => setIsLoading(false), 500);
      
      // Simple polling for new messages every 3 seconds
      const intervalId = setInterval(fetchMessages, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isOpen, order]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !order) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // optimistic clear
    
    // Optimistic UI update
    const tempMsg = {
      id: Date.now(),
      sender_id: currentUser.id,
      message: messageText,
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
      sender_role: currentUser.role
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch('http://localhost/pharma_backend/api/order_chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          sender_id: currentUser.id,
          message: messageText
        })
      });
      
      const data = await response.json();
      if (!data.success) {
        toast.error("Failed to send message");
        // Revert optimistic update
        setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
      } else {
        // Replace temp message with real one from server
        setMessages(prev => prev.map(msg => msg.id === tempMsg.id ? data.message : msg));
      }
    } catch (error) {
      toast.error("Network error");
      setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
    }
  };

  if (!isOpen || !order) return null;

  // render chat content based on state
  let chatContent = null;
  if (isLoading) {
    chatContent = (
      <div className="flex justify-center items-center h-full text-slate-400">
        <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading messages...
      </div>
    );
  } else if (messages.length === 0) {
    chatContent = (
      <div className="flex flex-col justify-center items-center h-full text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <p>No messages yet.</p>
        <p className="text-sm">Send a message to start the conversation.</p>
      </div>
    );
  } else {
    chatContent = messages.map((msg, index) => {
      let isMe = false;
      if (msg.sender_id === currentUser?.id) {
        isMe = true;
      }
      const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return (
        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
            {!isMe && <p className="text-[10px] font-bold text-blue-600 mb-1">{msg.sender_name}</p>}
            <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
            <p className={`text-[10px] text-right mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
              {msgTime}
            </p>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md h-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              {otherPartyName?.charAt(0) || '#'}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{otherPartyName || 'Order Chat'}</h2>
              <p className="text-blue-100 text-xs font-medium">Order #{order.id} • {order.items?.[0]?.generic_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white bg-blue-700/50 hover:bg-blue-700 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          {chatContent}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default OrderChatModal;
