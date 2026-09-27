export const restaurantSeedData = [
  {
    id: 'spice-route',
    name: 'Spice Route Kitchen',
    cuisine: 'North Indian',
    rating: '4.6 ★',
    deliveryTime: '25-30 min',
    priceRange: '₹400 for two',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    description: 'Comforting Indian classics, slow-cooked with bright spices and fresh herbs.',
    menu: [
      { id: 'butter-chicken-bowl', name: 'Butter Chicken Bowl', description: 'Creamy tomato curry with rice and naan.', price: 329 },
      { id: 'paneer-tikka', name: 'Paneer Tikka', description: 'Charred cottage cheese with mint chutney.', price: 249 },
    ],
  },
  {
    id: 'pizza-party',
    name: 'Pizza Party',
    cuisine: 'Italian, Pizza',
    rating: '4.5 ★',
    deliveryTime: '30-35 min',
    priceRange: '₹549 for two',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    description: 'Hand-stretched pizzas with crisp edges, generous toppings, and bold sauces.',
    menu: [
      { id: 'farmhouse-pizza', name: 'Farmhouse Pizza', description: 'Loaded with peppers, onions, mushrooms, and cheese.', price: 549 },
      { id: 'garlic-bread', name: 'Cheesy Garlic Bread', description: 'Toasted garlic bread finished with mozzarella.', price: 199 },
    ],
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl Co.',
    cuisine: 'Healthy, Salads',
    rating: '4.7 ★',
    deliveryTime: '20-25 min',
    priceRange: '₹350 for two',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    description: 'Fresh grain bowls, salads, and nourishing meals made for busy days.',
    menu: [
      { id: 'protein-bowl', name: 'Protein Power Bowl', description: 'Quinoa, roasted vegetables, chickpeas, and tahini.', price: 349 },
      { id: 'avocado-salad', name: 'Avocado Garden Salad', description: 'Crisp greens, avocado, corn, and citrus dressing.', price: 299 },
    ],
  },
];