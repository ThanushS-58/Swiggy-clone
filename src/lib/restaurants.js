import { restaurantSeedData } from '../data/restaurants';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function normalizeRestaurant(restaurant) {
  return {
    ...restaurant,
    id: String(restaurant.id),
    name: restaurant.name || restaurant.restaurantName || 'Restaurant',
    cuisine: restaurant.cuisine || 'Multi-cuisine',
    menu: Array.isArray(restaurant.menu) ? restaurant.menu : [],
  };
}

export async function getRestaurants() {
  const response = await fetch(`${API_URL}/restaurants`);

  if (!response.ok) {
    throw new Error('Could not load restaurants');
  }

  const restaurants = await response.json();
  return restaurants.map(normalizeRestaurant);
}

export async function getRestaurant(id) {
  const response = await fetch(`${API_URL}/restaurants/${id}`);

  if (!response.ok) {
    throw new Error('Could not load restaurant');
  }

  return normalizeRestaurant(await response.json());
}

export function getRestaurantSeedData() {
  return restaurantSeedData.map(normalizeRestaurant);
}

export { normalizeRestaurant };