import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
          const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.id)));
          const userOrders = snapshot.docs
            .map((order) => ({ id: order.id, ...order.data() }))
            .sort((first, second) => (second.createdAt?.seconds || 0) - (first.createdAt?.seconds || 0));
          setOrders(userOrders);
      } catch {
        setOrders([]);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <section className="orders-page empty-state">
        <h1>No orders yet</h1>
        <p>Please login to see your orders.</p>
        <Link to="/login" className="primary-btn">Login</Link>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="orders-page empty-state">
        <h1>No orders yet</h1>
        <p>Your recent food orders will appear here.</p>
        <Link to="/restaurants" className="primary-btn">Order food</Link>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <div className="section-header page-title-wrap">
        <div>
          <span className="eyebrow">Recent activity</span>
          <h2>Orders</h2>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <strong>{order.id}</strong>
                <p>{order.createdAt?.toDate?.().toLocaleString() || 'Recently placed'}</p>
              </div>
              <span className="status-badge">{order.status}</span>
            </div>

            <p className="order-payment">Payment: {order.paymentMethod || 'cod'}</p>

            <ul>
              {order.items.map((item, index) => (
                <li key={`${order.id}-${index}`}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>

            <div className="order-total">
              <strong>Total</strong>
              <strong>₹{order.total}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Orders;
