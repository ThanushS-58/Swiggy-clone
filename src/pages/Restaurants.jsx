import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurantSeedData, getRestaurants } from '../lib/restaurants';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants()
      .then((data) => setRestaurants(data.length ? data : getRestaurantSeedData()))
      .catch(() => setRestaurants(getRestaurantSeedData()));
  }, []);

  return (
    <section className="restaurants-page">
      <div className="section-header page-title-wrap">
        <div>
          <span className="eyebrow">Popular in your area</span>
          <h2>Restaurants</h2>
        </div>
      </div>

      <div className="restaurant-grid full-list">
        {restaurants.map((restaurant) => (
          <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} className="restaurant-card">
            <img src={restaurant.image || '/placeholder.png'} alt={restaurant.name} className="restaurant-image" />
            <div className="restaurant-body">
              <div className="restaurant-topline">
                <h3>{restaurant.name}</h3>
                <span>{restaurant.rating || '4.5 ★'}</span>
              </div>
              <p>{restaurant.cuisine}</p>
              <div className="restaurant-meta">
                <span>{restaurant.deliveryTime || '25-30 min'}</span>
                <span>{restaurant.priceRange || '₹200 for two'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Restaurants;
