import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';

function Checkout() {
  const { user } = useAuth();
  const { cartItems, subtotal, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(user?.paymentMethod || user?.payment_method || 'cod');

  useEffect(() => {
    setSelectedPaymentMethod(user?.paymentMethod || user?.payment_method || 'cod');
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page empty-state">
        <h1>Your cart is empty</h1>
        <p>Add a few dishes before placing your order.</p>
      </section>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.id), {
        address: user.address || '',
        paymentMethod: selectedPaymentMethod,
      }, { merge: true });

      await addDoc(collection(db, 'orders'), {
        userId: user.id,
        restaurantId: cartItems[0]?.restaurantId || 1,
        items: cartItems,
        paymentMethod: selectedPaymentMethod,
        total: subtotal + 35,
        status: 'placed',
        createdAt: serverTimestamp(),
      });

      cartItems.forEach((item) => removeFromCart(item.id, item.restaurantId));
      navigate('/orders');
    } catch (error) {
      alert(error.message || 'Order could not be saved.');
    }
  };

  return (
    <section className="checkout-page">
      <div className="section-header page-title-wrap">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h2>Checkout</h2>
        </div>
      </div>

      <div className="checkout-grid">
        <div className="checkout-card">
          <h3>Delivery address</h3>
          <div className="address-box">
            <strong>{user ? user.name : 'Guest user'}</strong>
            <p>{user?.address || 'No address saved yet. Add one while signing up or update it before checkout.'}</p>
          </div>

          <h3>Payment method</h3>
          <div className="payment-box">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedPaymentMethod === 'cod'}
                onChange={() => setSelectedPaymentMethod('cod')}
              />
              Cash on delivery
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedPaymentMethod === 'upi'}
                onChange={() => setSelectedPaymentMethod('upi')}
              />
              UPI
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedPaymentMethod === 'card'}
                onChange={() => setSelectedPaymentMethod('card')}
              />
              Card
            </label>
          </div>
        </div>

        <div className="checkout-card summary-box">
          <h3>Order summary</h3>
          {cartItems.map((item) => (
            <div key={`${item.restaurantId}-${item.id}`} className="summary-line">
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>₹{item.price * item.quantity}</strong>
            </div>
          ))}

          <div className="summary-row">
            <span>Item total</span>
            <strong>₹{subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <strong>₹35</strong>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <strong>₹{subtotal + 35}</strong>
          </div>

          <button type="button" className="primary-btn full-width" onClick={handlePlaceOrder}>
            Place order
          </button>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
