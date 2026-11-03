import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart, Loader2, Minus, Plus, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { getCart, removeFromCart, updateQuantity, getCartTotal } from '../lib/cart';
import { SEO } from '../components/SEO';

export function Cart() {
  const [cartItems, setCartItems] = useState(getCart());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleUpdate = () => setCartItems(getCart());
    window.addEventListener('cart-updated', handleUpdate);
    setLoading(false);
    return () => window.removeEventListener('cart-updated', handleUpdate);
  }, []);
  
  const subtotal = getCartTotal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <SEO title="Cart" noindex />
        <Loader2 className="animate-spin text-[#00B4D8]" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-6 lg:py-16 text-[#1A2B4C]">
      <SEO title="Project Staging Cart | AV Live Communications" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Reference Screen-4 Header (< 1024px) */}
        <div className="lg:hidden flex items-center justify-between mb-5">
          <Link
            to="/shop"
            aria-label="Back to Shop"
            className="min-w-[48px] min-h-[48px] w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#1A2B4C]"
          >
            <span className="text-base font-bold leading-none">&lsaquo;</span>
          </Link>
          <span className="text-base font-black text-[#1A2B4C] tracking-tight">Cart</span>
          <div className="min-w-[48px] min-h-[48px] flex items-center justify-end">
            <span className="text-xs font-black text-[#2B4C8C] bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        {/* Desktop Header (>= 1024px) */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between mb-12">
           <div>
             <h1 className="text-4xl font-black tracking-tight">Project Staging</h1>
             <p className="text-gray-400 mt-2 font-black uppercase tracking-widest text-[10px]">Hardware Ready for Deployment</p>
           </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 lg:p-16 rounded-3xl lg:rounded-[3rem] border border-gray-100 shadow-sm text-center">
             <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingCart size={40} />
             </div>
             <h2 className="text-2xl font-black mb-4">Inventory Empty</h2>
             <p className="text-gray-400 mb-8 font-medium">Your project staging area has no hardware units.</p>
             <Link to="/shop" className="inline-flex items-center justify-center min-h-[48px] bg-[#1A2B4C] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all shadow-xl">
                Browse Catalog
             </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
            <div className="lg:col-span-2 space-y-3.5 lg:space-y-6">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-2xl lg:rounded-[2.5rem] border border-gray-100 flex gap-3.5 sm:gap-6 lg:gap-8 items-center shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#F8F9FA] lg:bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 p-1.5 lg:p-0">
                    <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-contain lg:object-cover mix-blend-multiply lg:mix-blend-normal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-xs sm:text-base lg:text-lg text-[#1A2B4C] line-clamp-1">{item.name}</h3>
                        <div className="text-[10px] font-semibold lg:font-black text-gray-400 lg:text-[#00B4D8] uppercase tracking-wider mt-0.5">{item.brand || 'Official PK Warranty'}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="lg:hidden min-w-[48px] min-h-[48px] -mr-2 -mt-2 flex items-center justify-center text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2.5 lg:mt-2">
                      <p className="text-xs sm:text-sm font-black text-[#1A2B4C]">Rs. {(item.price ?? 0).toLocaleString()}</p>

                      {/* Mobile Reference Screen-4 Quantity Stepper Pill */}
                      <div className="lg:hidden flex items-center bg-[#F8F9FA] rounded-full px-1 py-0.5 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                          className="min-w-[48px] min-h-[48px] -my-2 -ml-1 flex items-center justify-center text-gray-500 hover:text-[#1A2B4C]"
                        >
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                            <Minus size={12} />
                          </span>
                        </button>
                        <span className="w-6 text-center font-black text-xs text-[#1A2B4C]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="min-w-[48px] min-h-[48px] -my-2 -mr-1 flex items-center justify-center text-white"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#1A2B4C] flex items-center justify-center shadow-sm">
                            <Plus size={12} />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Quantity & Delete Controls (>= 1024px) */}
                  <div className="hidden lg:flex items-center gap-6">
                    <div className="flex items-center bg-[#F8F9FA] rounded-xl p-1 border border-gray-100">
                       <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] transition-colors"
                       >
                         <Minus size={16} />
                       </button>
                       <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                       <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] transition-colors"
                       >
                         <Plus size={16} />
                       </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div>
              {/* Mobile Reference Screen-4 Clean Summary Block (< 1024px) */}
              <div className="lg:hidden bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                  <span>Sub Total</span>
                  <span className="font-bold text-gray-600">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                  <span>Shipping &amp; Fee</span>
                  <span className="font-bold text-emerald-600">{subtotal >= 100000 ? 'Free (Insured)' : 'Rs. 1,500'}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black text-[#1A2B4C]">Total</span>
                  <span className="text-base font-black text-[#1A2B4C]">
                    Rs. {(subtotal + (subtotal >= 100000 ? 0 : 1500)).toLocaleString()}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="mt-2 w-full min-h-[48px] bg-[#1A2B4C] hover:bg-[#00B4D8] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <Zap size={15} />
                </Link>
              </div>

              {/* Desktop Logistics Summary Card (>= 1024px) */}
              <div className="hidden lg:block bg-[#1A2B4C] rounded-[2.5rem] p-10 sticky top-32 shadow-2xl text-white overflow-hidden group">
                <h3 className="font-black text-xl mb-10 border-b border-white/10 pb-6 uppercase tracking-widest text-[12px] text-gray-500">Logistics Summary</h3>
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Hardware Value</span>
                    <span className="text-white">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>In-System Storage</span>
                    <span className="text-emerald-500">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Logistics Protocol</span>
                    <span className="text-white">Calculated at Checkout</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-white/10 pt-10 mb-10">
                  <span className="font-black text-lg uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-3xl text-[#00B4D8]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                
                <Link to="/checkout" className="w-full bg-white text-[#1A2B4C] py-6 rounded-2xl font-black hover:bg-[#00B4D8] hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95">
                  Begin Deployment <Zap size={18} />
                </Link>
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
