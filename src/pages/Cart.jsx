import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <section className="cart-page empty-cart">
        <h1>Your Cart</h1>
        <p>Your cart is empty. Add items from restaurant menus.</p>
        <Link to="/restaurants" className="primary-btn">Browse restaurants</Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="section-header page-title-wrap">
        <div>
          <span className="eyebrow">Your order</span>
          <h2>Cart</h2>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={`${item.restaurantId}-${item.id}`} className="cart-item">
              <div>
                <h3>{item.name}</h3>
                <p>{item.restaurantName}</p>
              </div>

              <div className="cart-item-actions">
                <div className="quantity-box">
                  <button type="button" onClick={() => updateQuantity(item.id, item.restaurantId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.restaurantId, 1)}>+</button>
                </div>
                <strong>₹{item.price * item.quantity}</strong>
                <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id, item.restaurantId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Bill Details</h3>
          <div className="summary-row">
            <span>Item total</span>
            <strong>₹{subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <strong>₹35</strong>
          </div>
          <div className="summary-row total-row">
            <span>To pay</span>
            <strong>₹{subtotal + 35}</strong>
          </div>
          <Link to="/checkout" className="primary-btn checkout-btn">Place order</Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
