import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getRestaurant, getRestaurantSeedData } from '../lib/restaurants';

function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    getRestaurant(id)
      .then(setRestaurant)
      .catch(() => setRestaurant(getRestaurantSeedData().find((item) => item.id === id) || null));
  }, [id]);

  if (!restaurant) {
    return <p className="loading-text">Loading restaurant details...</p>;
  }

  return (
    <section className="restaurant-detail-page">
      <Link to="/restaurants" className="back-link">← Back to restaurants</Link>

      <div className="detail-hero">
        <img src={restaurant.image} alt={restaurant.name} className="detail-image" />
        <div className="detail-copy">
          <span className="eyebrow">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description || 'Authentic flavors, quick delivery, and a warm dining experience.'}</p>
          <div className="detail-meta">
            <span>{restaurant.rating || '4.5 ★'}</span>
            <span>{restaurant.deliveryTime || '25-30 min'}</span>
            <span>{restaurant.priceRange || '₹200 for two'}</span>
          </div>
        </div>
      </div>

      <div className="menu-section">
        <h2>Popular dishes</h2>

        <div className="menu-list">
          {restaurant.menu.map((item) => (
            <div key={item.id} className="menu-item">
              <div>
                <h3>{item.name}</h3>
                <p>{item.description || 'Freshly prepared and packed with flavor.'}</p>
              </div>
              <div className="menu-actions">
                <strong>₹{item.price}</strong>
                <button
                  type="button"
                  onClick={() => addToCart({ ...item, restaurantId: restaurant.id, restaurantName: restaurant.name })}
                  className="add-btn"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RestaurantDetail;
