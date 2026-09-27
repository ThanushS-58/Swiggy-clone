import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurantSeedData, getRestaurants } from '../lib/restaurants';

function Home() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants()
      .then((data) => setRestaurants(data.length ? data : getRestaurantSeedData()))
      .catch(() => setRestaurants(getRestaurantSeedData()));
  }, []);

  return (
    <section className="home-page">
      <div className="hero-banner">
        <div className="hero-copy">
          <span className="eyebrow">Order food online</span>
          <h1>Craving something delicious?</h1>
          <p>
            Discover the best restaurants near you and enjoy fast delivery from your favorite local spots.
          </p>
          <div className="hero-actions">
            <Link to="/restaurants" className="primary-btn">Explore restaurants</Link>
            <Link to="/cart" className="secondary-btn">View cart</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="food-card main-card">
            <span className="mini-tag">Popular</span>
            <h3>Butter Chicken Bowl</h3>
            <p>₹329 • 25 min</p>
          </div>
          <div className="food-card floating-card">
            <span className="mini-tag alt">Fast delivery</span>
            <h3>Pizza Party</h3>
            <p>₹549 • 30 min</p>
          </div>
        </div>
      </div>

      <div className="categories-row">
        <span>Biriyani</span>
        <span>Pizza</span>
        <span>Cakes</span>
        <span>Healthy</span>
        <span>Beverages</span>
      </div>

      <div className="section-header">
        <h2>Restaurants near you</h2>
      </div>

      <div className="restaurant-grid">
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

export default Home;
