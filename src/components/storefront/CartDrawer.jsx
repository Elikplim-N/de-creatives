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
    showToast,
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'success'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
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
    if (!formData.email || !formData.fullName || !formData.address) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        // Prepare order structure for de_orders
        const orderData = {
          id: `ord-${Date.now()}`,
          customer_email: formData.email,
          customer_name: formData.fullName,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
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
          status: 'pending'
        };

        const { error } = await supabase.from('de_orders').insert([orderData]);
        if (error) throw error;
      }

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

  const closeDrawer = () => {
    setIsCartOpen(false);
    // Reset step after animations
    setTimeout(() => setCheckoutStep('cart'), 300);
  };

  return (
    <div className="cart-drawer-overlay" onClick={closeDrawer}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Shopping Bag">
        {/* Header */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            {checkoutStep === 'success' ? 'ORDER CONFIRMED' : checkoutStep === 'checkout' ? 'CHECKOUT' : `SHOPPING BAG (${cartCount})`}
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
                  placeholder="Street Address, Apt / Suite"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="cart-drawer__form-input"
                />
              </div>
              <div className="cart-drawer__form-row">
                <div className="cart-drawer__form-group">
                  <label htmlFor="checkout-city">City *</label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    required
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="cart-drawer__form-input"
                  />
                </div>
                <div className="cart-drawer__form-group">
                  <label htmlFor="checkout-zip">Postal Code *</label>
                  <input
                    id="checkout-zip"
                    type="text"
                    name="postalCode"
                    required
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="cart-drawer__form-input"
                  />
                </div>
              </div>

              <h3 className="cart-drawer__form-heading" style={{ marginTop: '1.5rem' }}>Payment (Mock Billing)</h3>
              <p className="cart-drawer__mock-payment-text">This is a secure checkout demonstration connected directly to Supabase storage. Card inputs are simulated.</p>
              <div className="cart-drawer__form-group">
                <label>Card Details</label>
                <input
                  type="text"
                  disabled
                  placeholder="4111 2222 3333 4444  ·  12/28  ·  123"
                  className="cart-drawer__form-input cart-drawer__form-input--disabled"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg cart-drawer__submit-btn"
                style={{ marginTop: '2rem', width: '100%' }}
              >
                {loading ? 'Processing Order...' : `Pay & Place Order · ${formatPrice(total)}`}
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

          {checkoutStep === 'success' && (
            <div className="cart-drawer__success">
              <div className="cart-drawer__success-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--turquoise)" strokeWidth="2.5" className="cart-drawer__success-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="cart-drawer__success-heading">THANK YOU FOR YOUR ORDER</h3>
              <p className="cart-drawer__success-text">Your order details have been successfully synced and logged in our system. We have sent a confirmation details invoice to your email.</p>
              <button className="btn btn-primary btn-lg" onClick={closeDrawer} style={{ marginTop: '2.5rem', width: '100%' }}>
                Continue Shopping
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
