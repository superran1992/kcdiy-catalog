"use client";
import React, { useState, useMemo, useEffect } from 'react';
import data from '../assets_data.json';

// 1. 顶级架构配置 [cite: 1]
const CATEGORY_CONFIG: { [key: string]: any } = {
  mats: { name: 'Premium Desk Mats', ratio: 'aspect-[7/3]', emoji: '✨', available: true, count: Object.values(data).length },
  beads: { name: 'Decorative Beads', ratio: 'aspect-square', emoji: '🌸', available: false, count: 0 },
  spacers: { name: 'Custom Spacers', ratio: 'aspect-square', emoji: '🎀', available: false, count: 0 }
};

const allProducts = Object.values(data);
const subCategories = Array.from(new Set(allProducts.map(p => p.Category)));

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<'home' | 'catalog'>('home');
  const [activeMajor, setActiveMajor] = useState('mats');
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");
  const [cart, setCart] = useState<{ [key: string]: any }>({});
  const [cartAnimate, setCartAnimate] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  // 📧 潜客留存与精准校验状态 
  const [showContactForm, setShowContactForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({ name: false, email: false });
  const [isShaking, setIsShaking] = useState(false);

  // 1. 数据持久化 (LocalStorage) [cite: 2]
  useEffect(() => {
    const saved = localStorage.getItem('kcdiy_v75_storage');
    if (saved) {
      const { cart: sCart, view: sView, activeMajor: sMajor } = JSON.parse(saved);
      setCart(sCart || {});
      setView(sView || 'home');
      setActiveMajor(sMajor || 'mats');
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('kcdiy_v75_storage', JSON.stringify({ cart, view, activeMajor }));
    }
  }, [cart, view, activeMajor, isMounted]);

  const cartItems = Object.values(cart);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = totalItemsCount * 8;

  // 购物车变化动画反馈 [cite: 6]
  useEffect(() => {
    if (isMounted && totalItemsCount > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItemsCount, isMounted]);

  if (!isMounted) return null;

  // 2. 核心操作逻辑
  const addToCart = (product: any) => {
    setCart(prev => ({
      ...prev,
      [product.ID]: prev[product.ID] ? { ...prev[product.ID], qty: prev[product.ID].qty + 1 } : { ...product, qty: 1 }
    }));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const newQty = (prev[id].qty || 0) + delta;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...prev[id], qty: newQty } };
    });
  };

  const clearAllItems = () => {
    if (window.confirm("Clear all items from your cart?")) {
      setCart({});
      setShowCart(false);
    }
  };

  // 🚀 核心：表单验证与 Resent 整合跳转 
  const handleFinalCheckout = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameValid = customerInfo.name.trim().length > 0;
    const emailValid = emailRegex.test(customerInfo.email);

    if (!nameValid || !emailValid) {
      setErrors({ name: !nameValid, email: !emailValid });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const styleNotes = cartItems.map(item => `${item.ID}-${item.Style} (x${item.qty})`).join(", ");
    try { await navigator.clipboard.writeText(styleNotes); } catch (e) {}

    // 发送包含图片数组的 Resend 请求 
    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          cartItems: cartItems, 
          total: totalPrice
        })
      });
    } catch (err) { console.error("Email service error:", err); }

    const checkoutUrl = `https://kcdiy.live/checkout/?add-to-cart=228&quantity=${totalPrice}&order_comments=${encodeURIComponent(styleNotes)}`;
    window.open(checkoutUrl, '_blank');
    setShowContactForm(false);
    setErrors({ name: false, email: false });
  };

  const filteredProducts = allProducts.filter(p => {
    const matchSearch = p.Style.toLowerCase().includes(search.toLowerCase()) || p.ID.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedSubCat || selectedSubCat === "All" || p.Category === selectedSubCat;
    return matchSearch && matchCat;
  });

  // 🏠 视图 A：Home [cite: 8]
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#FCFAF7] px-8 py-24 flex flex-col items-center text-center">
        <header className="mb-24">
          <h1 className="text-6xl font-serif tracking-tighter text-[#2D2D2D] mb-4 italic">KC DIY</h1>
          <div className="h-[1px] w-16 bg-[#2D2D2D]/20 mx-auto mb-6"></div>
          <p className="text-[10px] tracking-[0.5em] text-[#A0A0A0] uppercase font-bold">Artisan Boutique</p>
        </header>
        <div className="w-full max-w-lg space-y-5">
          {Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => (
            <button key={id} disabled={!cfg.available} onClick={() => { setActiveMajor(id); setView('catalog'); }}
              className={`w-full group h-24 rounded-2xl flex items-center px-8 transition-all duration-500 ${cfg.available ? 'bg-white shadow-sm border border-[#EEE] hover:border-[#2D2D2D]' : 'bg-transparent border border-[#F0F0F0] opacity-30'}`}>
              <span className="text-3xl mr-6">{cfg.emoji}</span>
              <div className="flex flex-col items-start flex-1 text-left">
                <span className="text-base font-bold tracking-widest text-[#2D2D2D] uppercase">{cfg.name}</span>
                <span className="text-[10px] text-[#A0A0A0] font-medium mt-1">{cfg.available ? `${cfg.count} STYLES AVAILABLE` : 'Coming Soon'}</span>
              </div>
              {cfg.available && <span className="text-xl">→</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 🛍️ 视图 B：Catalog [cite: 10]
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-80">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-4 py-8 border-b border-[#F5F5F5]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('home')} className="h-10 px-5 bg-white border border-[#EEE] text-[10px] font-black rounded-full tracking-widest active:scale-95 transition-all uppercase">Back</button>
            <input type="text" placeholder="Search Style or ID..." className="flex-1 h-10 px-5 bg-[#F5F5F5] rounded-full border-none outline-none text-sm" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={selectedSubCat} onChange={(e) => setSelectedSubCat(e.target.value)} className="w-full h-10 px-5 bg-white border border-[#EEE] rounded-xl text-[10px] font-bold tracking-widest text-[#2D2D2D] appearance-none">
            <option value="" disabled>── PLEASE SELECT A CATEGORY ──</option> 
            <option value="All">ALL COLLECTIONS</option>
            {subCategories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((p: any) => (
          <div key={p.ID} className="bg-white flex flex-col group">
            {/* 7:3 比例显示 [cite: 7] */}
            <div onClick={() => setZoomImg(p.Image)} className={`${CATEGORY_CONFIG[activeMajor].ratio} bg-[#F8F8F8] relative overflow-hidden rounded-[2rem] mb-4 border border-black/5 cursor-zoom-in`}>
              <img src={p.Image} alt={p.Style} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-[9px] font-bold px-3 py-1 rounded-full text-[#2D2D2D]">{p.ID}</div>
            </div>
            <div className="px-2 flex flex-col flex-1 justify-between gap-4">
              <h3 className="text-[11px] font-bold text-[#2D2D2D] leading-tight uppercase tracking-tight line-clamp-1">{p.Style}</h3>
              <button onClick={() => addToCart(p)}
                className={`w-full py-4 text-[9px] font-black rounded-2xl transition-all duration-300 uppercase tracking-widest ${cart[p.ID] ? 'bg-[#10B981] text-white shadow-lg' : 'bg-[#2D2D2D] text-white active:scale-95'}`}>
                {cart[p.ID] ? 'ADDED ✓' : `ADD TO CART | $8.00`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {zoomImg && <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomImg(null)}><img src={zoomImg} className="max-w-full max-h-full rounded-lg shadow-2xl" /></div>}

      {/* 📧 "Almost Done!" 精准校验表单  */}
      {showContactForm && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className={`bg-white w-full max-w-sm rounded-[3rem] p-12 shadow-2xl transition-all ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
              }
            `}</style>
            <h2 className="font-serif text-3xl mb-4 text-center text-[#2D2D2D]">Almost Done!</h2>
            <p className="text-[10px] text-[#A0A0A0] text-center mb-10 uppercase tracking-widest font-black">Save your selection before paying</p>
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className={`w-full h-14 bg-[#F9F9F9] rounded-2xl px-6 outline-none text-sm font-bold border transition-colors ${errors.name ? 'border-red-500' : 'border-transparent'} focus:border-black`} 
                  onChange={e => { setCustomerInfo({...customerInfo, name: e.target.value}); setErrors({...errors, name: false}); }} 
                />
                {errors.name && <p className="text-[9px] text-red-500 mt-2 font-black uppercase tracking-widest ml-2 italic text-left">Name is required</p>}
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className={`w-full h-14 bg-[#F9F9F9] rounded-2xl px-6 outline-none text-sm font-bold border transition-colors ${errors.email ? 'border-red-500' : 'border-transparent'} focus:border-black`} 
                  onChange={e => { setCustomerInfo({...customerInfo, email: e.target.value}); setErrors({...errors, email: false}); }} 
                />
                {errors.email && <p className="text-[9px] text-red-500 mt-2 font-black uppercase tracking-widest ml-2 italic text-left">Please enter a valid email address</p>}
              </div>
              <button onClick={handleFinalCheckout} className="w-full h-16 bg-[#2D2D2D] text-white rounded-full font-black tracking-widest mt-6 shadow-xl active:scale-95 transition-all">CONFIRM & PAY</button>
              <button onClick={() => { setShowContactForm(false); setErrors({name:false, email:false}); }} className="w-full text-[10px] font-bold opacity-30 mt-4 uppercase text-center">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 底部固定购物车 [cite: 10] */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex flex-col items-center gap-4">
          {showCart && (
            <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-[#F0F0F0] p-10 mb-2 animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-8 px-2">
                <span className="font-serif text-2xl text-[#2D2D2D]">Your Selection</span>
                <div className="flex gap-6 items-center">
                  <button onClick={clearAllItems} className="text-[10px] font-black tracking-widest text-red-400 hover:text-red-600 uppercase">Clear All</button>
                  <button onClick={() => setShowCart(false)} className="text-[10px] font-bold opacity-30 tracking-widest uppercase">Close</button>
                </div>
              </div>
              <div className="max-h-[35vh] overflow-y-auto space-y-6 pr-2">
                {cartItems.map((item: any) => (
                  <div key={item.ID} className="flex items-center gap-6">
                    <img src={item.Image} className="w-24 h-12 rounded-lg object-cover bg-[#F5F5F5]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#2D2D2D] truncate uppercase tracking-tight mb-1">{item.Style}</p>
                      <p className="text-xs text-[#A0A0A0] tracking-widest">$8.00</p>
                    </div>
                    <div className="flex items-center gap-4 bg-[#F8F8F8] rounded-xl px-4 py-2 font-bold">
                      <button onClick={() => updateQty(item.ID, -1)} className="text-xl opacity-30 hover:opacity-100">－</button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.ID, 1)} className="text-xl text-[#2D2D2D]">＋</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🚚 满额包邮逻辑 [cite: 5, 11] */}
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-lg border border-black/5 rounded-2xl p-3 text-center">
            {totalPrice < 50 ? (
              <p className="text-[10px] font-bold text-[#2D2D2D] tracking-wider uppercase">
                ADD <span className="text-emerald-500">${(50 - totalPrice).toFixed(2)}</span> MORE FOR <span className="underline">FREE SHIPPING</span> 📦
              </p>
            ) : (
              <p className="text-[10px] font-black text-emerald-600 tracking-[0.2em] uppercase animate-pulse text-center">✨ FREE SHIPPING UNLOCKED ✨</p>
            )}
          </div>

          <div className="w-full max-w-lg flex gap-3">
             <button onClick={() => setShowCart(!showCart)} 
                className={`flex-1 h-20 rounded-full font-black text-[11px] tracking-widest shadow-xl transition-all duration-300 ${cartAnimate ? 'bg-[#10B981] text-white scale-105' : 'bg-white border border-[#EEE] text-[#2D2D2D]'}`}>
                {showCart ? 'BACK TO SHOP' : `VIEW CART (${totalItemsCount})`}
              </button>
              <button onClick={() => setShowContactForm(true)} className="flex-[1.8] h-20 bg-[#2D2D2D] text-white rounded-full font-black text-xs shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center text-center">
                <span className="text-[9px] opacity-40 tracking-[0.3em] mb-1 uppercase tracking-widest">Secure Checkout</span>
                <span className="text-lg tracking-tighter uppercase font-black">PROCEED • ${(totalPrice).toFixed(2)}</span>
              </button>
          </div>
        </div>
      )}
    </div>
  );
}