import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQty,
    clearCart,
    formatPrice,
    currency,
    currencies,
    showToast,
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'success'
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo', 'cod'
  const [placedOrder, setPlacedOrder] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
  });

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleQtyChange = (item, newQty) => {
    updateCartQty(item.cartId, newQty);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.address || !formData.city) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    try {
      // Prepare order structure. `id` is left for Postgres to generate
      // (uuid primary key) - order_number is the human-readable reference
      // shown to the customer and sent over WhatsApp.
      const orderData = {
        order_number: orderId,
        customer_email: formData.email,
        customer_name: formData.fullName,
        shipping_address: `${formData.address}, ${formData.city}`,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          color: item.color,
          qty: item.qty,
          price: item.price
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        payment_method: paymentMethod,
        status: 'pending'
      };

      if (supabase) {
        const { error } = await supabase.from('de_orders').insert([orderData]);
        if (error) throw error;
      }

      setPlacedOrder({ ...orderData, id: orderId });
      setCheckoutStep('success');
      clearCart();
      showToast('Order placed successfully!', 'success');
    } catch (err) {
      console.error('Checkout error:', err.message);
      showToast(`Checkout failed: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!placedOrder) return;

    // Convert items details to a clean readable list
    const itemsText = placedOrder.items
      .map(item => `• ${item.name} (${item.size} / ${item.color}) x${item.qty}`)
      .join('\n');

    const totalText = formatPrice(placedOrder.total);

    const message = `Hello DE Creatives! I just placed an order on your site.\n\n*Order ID:* ${placedOrder.id}\n*Customer:* ${placedOrder.customer_name}\n*Total:* ${totalText} (${currency})\n*Payment Method:* ${placedOrder.payment_method === 'momo' ? 'Mobile Money (MoMo)' : 'Cash on Delivery'}\n\n*Items:*\n${itemsText}\n\n*Delivery Address:*\n${placedOrder.shipping_address}`;

    const encodedMessage = encodeURIComponent(message);
    // WhatsApp redirect to business representative number (e.g. +233532391663 or similar)
    window.open(`https://wa.me/233532391663?text=${encodedMessage}`, '_blank');
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setCheckoutStep('cart');
      setPlacedOrder(null);
    }, 300);
  };

  return (
    <div className="cart-drawer-overlay" onClick={closeDrawer}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Shopping Bag">
        {/* Header */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            {checkoutStep === 'success' ? 'ORDER PLACED' : checkoutStep === 'checkout' ? 'CHECKOUT' : `SHOPPING BAG (${cartCount})`}
          </h2>
          <button className="cart-drawer__close-btn" onClick={closeDrawer} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Container */}
        <div className="cart-drawer__content-wrap">
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="cart-drawer__empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <p className="cart-drawer__empty-text">Your shopping bag is currently empty.</p>
                  <button className="btn btn-primary" onClick={closeDrawer} style={{ marginTop: '1.5rem' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-drawer__items-list">
                  {cart.map((item) => {
                    const images = item.images || [];
                    return (
                      <div className="cart-drawer__item" key={item.cartId}>
                        <img
                          src={images[0] || '/logo.png'}
                          alt={item.name}
                          className="cart-drawer__item-img"
                        />
                        <div className="cart-drawer__item-info">
                          <span className="cart-drawer__item-category">{item.categoryName}</span>
                          <h3 className="cart-drawer__item-name">{item.name}</h3>
                          <div className="cart-drawer__item-attributes">
                            <span className="cart-drawer__attr-tag">Size: {item.size}</span>
                            <span className="cart-drawer__attr-tag">
                              Color: <span className="cart-drawer__color-dot" style={{ background: item.color }} />
                            </span>
                          </div>
                          <div className="cart-drawer__item-controls">
                            <div className="cart-drawer__qty-selector">
                              <button
                                className="cart-drawer__qty-btn"
                                onClick={() => handleQtyChange(item, item.qty - 1)}
                                aria-label="Decrease quantity"
                              >−</button>
                              <span className="cart-drawer__qty-val">{item.qty}</span>
                              <button
                                className="cart-drawer__qty-btn"
                                onClick={() => handleQtyChange(item, item.qty + 1)}
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                            <span className="cart-drawer__item-price">
                              {formatPrice(item.price * item.qty)}
                            </span>
                          </div>
                        </div>
                        <button
                          className="cart-drawer__item-remove"
                          onClick={() => removeFromCart(item.cartId)}
                          aria-label="Remove item"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <form onSubmit={handleCheckoutSubmit} className="cart-drawer__checkout-form">
              <h3 className="cart-drawer__form-heading">Shipping Details</h3>
              <div className="cart-drawer__form-group">
                <label htmlFor="checkout-email">Email Address *</label>
                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="cart-drawer__form-input"
                />
              </div>
              <div className="cart-drawer__form-group">
                <label htmlFor="checkout-name">Full Name *</label>
                <input
                  id="checkout-name"
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="cart-drawer__form-input"
                />
              </div>
              <div className="cart-drawer__form-group">
                <label htmlFor="checkout-address">Delivery Address *</label>
                <input
                  id="checkout-address"
                  type="text"
                  name="address"
                  required
                  placeholder="Street Address, Area or Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="cart-drawer__form-input"
                />
              </div>
              <div className="cart-drawer__form-group">
                <label htmlFor="checkout-city">City / Region *</label>
                <input
                  id="checkout-city"
                  type="text"
                  name="city"
                  required
                  placeholder="Accra, Kumasi, East Legon etc."
                  value={formData.city}
                  onChange={handleInputChange}
                  className="cart-drawer__form-input"
                />
              </div>

              <h3 className="cart-drawer__form-heading" style={{ marginTop: '1.5rem' }}>Payment Method</h3>
              <div className="cart-drawer__form-group">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
                  <label className="cart-drawer__payment-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--white-05)', borderRadius: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      style={{ accentColor: 'var(--turquoise)' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.85rem' }}>Mobile Money (MoMo) Transfer</span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Pay via MTN / Telecel / AT Money</p>
                    </div>
                  </label>
                  <label className="cart-drawer__payment-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--white-05)', borderRadius: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: 'var(--turquoise)' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.85rem' }}>Cash on Delivery</span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Pay cash when your order arrives</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg cart-drawer__submit-btn"
                style={{ marginTop: '2rem', width: '100%' }}
              >
                {loading ? 'Processing Order...' : `Place Order · ${formatPrice(total)}`}
              </button>
              <button
                type="button"
                className="cart-drawer__back-btn"
                onClick={() => setCheckoutStep('cart')}
              >
                ← Back to bag
              </button>
            </form>
          )}

          {checkoutStep === 'success' && placedOrder && (
            <div className="cart-drawer__success" style={{ padding: 'var(--space-4) 0' }}>
              <div className="cart-drawer__success-icon-wrap" style={{ margin: '0 auto var(--space-4) auto' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--turquoise)" strokeWidth="2.5" className="cart-drawer__success-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="cart-drawer__success-heading" style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>ORDER REGISTERED</h3>
              <p className="cart-drawer__success-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                Order Ref: <strong>#{placedOrder.id}</strong>
              </p>

              {placedOrder.payment_method === 'momo' ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '6px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.78rem', letterSpacing: '0.05em', color: 'var(--white)', margin: '0 0 10px 0', textTransform: 'uppercase' }}>MTN Mobile Money Instructions</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    • Send MoMo to: <strong>053 239 1663</strong>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    • Registered Name: <strong>DE Creatives</strong>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    • Reference: <strong>#{placedOrder.id}</strong>
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--turquoise)', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                    Please complete the transfer, then click the button below to confirm payment with us via WhatsApp.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '6px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.78rem', letterSpacing: '0.05em', color: 'var(--white)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Cash On Delivery</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Your order is pending verification. Please click the button below to send your order info to our team on WhatsApp for immediate dispatch confirmation.
                  </p>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                onClick={handleWhatsAppRedirect}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', borderColor: '#25D366' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.161.001 6.132 1.233 8.368 3.472 2.235 2.24 3.461 5.215 3.46 8.378-.003 6.536-5.328 11.86-11.859 11.86-2.007-.001-3.98-.513-5.736-1.489L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.26 1.486 5.417 0 9.825-4.414 9.827-9.836.001-2.627-1.02-5.1-2.874-6.958C16.99 1.888 14.5.86 11.862.86c-5.42 0-9.829 4.415-9.831 9.837-.001 1.887.493 3.73 1.427 5.33L2.454 21.5l5.59-1.465zM17.15 14.4c-.29-.145-1.713-.846-1.978-.942-.265-.096-.458-.145-.65.145-.193.29-.747.942-.916 1.132-.169.19-.338.212-.627.067-.29-.145-1.22-.45-2.325-1.434-.86-.767-1.44-1.714-1.61-2.004-.168-.29-.018-.446.126-.59.13-.13.29-.338.434-.508.145-.17.193-.29.29-.483.096-.19.048-.36-.024-.506-.072-.145-.65-1.568-.89-2.146-.233-.563-.47-.487-.65-.496-.168-.008-.362-.01-.555-.01-.193 0-.506.072-.77.36-.266.29-1.013.99-1.013 2.413 0 1.42 1.037 2.793 1.18 2.987.145.195 2.04 3.115 4.94 4.37.69.298 1.229.477 1.65.612.693.22 1.324.19 1.823.115.556-.08 1.713-.7 1.953-1.375.24-.675.24-1.255.17-1.375-.07-.12-.266-.19-.556-.335z"/>
                </svg>
                Confirm on WhatsApp
              </button>

              <button className="btn btn-outline" onClick={closeDrawer} style={{ marginTop: '0.75rem', width: '100%' }}>
                Close & Return
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && checkoutStep === 'cart' && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary-row">
              <span className="cart-drawer__summary-label">Bag Subtotal</span>
              <span className="cart-drawer__summary-val">{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-drawer__summary-row">
              <span className="cart-drawer__summary-label">Shipping</span>
              <span className="cart-drawer__summary-val">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="cart-drawer__summary-total">
              <span>Total Estim.</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="btn btn-primary btn-lg cart-drawer__checkout-btn" onClick={() => setCheckoutStep('checkout')}>
              Proceed to Checkout
            </button>
            <p className="cart-drawer__footer-note">Free standard shipping on orders above $150. Easy returns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
