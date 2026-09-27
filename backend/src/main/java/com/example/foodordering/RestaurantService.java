package com.example.foodordering;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {
    private final List<Restaurant> restaurants = List.of(
            new Restaurant(
                    "spice-route",
                    "Spice Route Kitchen",
                    "North Indian",
                    "4.6 ★",
                    "25-30 min",
                    "₹400 for two",
                    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
                    "Comforting Indian classics, slow-cooked with bright spices and fresh herbs.",
                    List.of(
                            new MenuItem("butter-chicken-bowl", "Butter Chicken Bowl", "Creamy tomato curry with rice and naan.", 329),
                            new MenuItem("paneer-tikka", "Paneer Tikka", "Charred cottage cheese with mint chutney.", 249)
                    )
            ),
            new Restaurant(
                    "pizza-party",
                    "Pizza Party",
                    "Italian, Pizza",
                    "4.5 ★",
                    "30-35 min",
                    "₹549 for two",
                    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
                    "Hand-stretched pizzas with crisp edges, generous toppings, and bold sauces.",
                    List.of(
                            new MenuItem("farmhouse-pizza", "Farmhouse Pizza", "Loaded with peppers, onions, mushrooms, and cheese.", 549),
                            new MenuItem("garlic-bread", "Cheesy Garlic Bread", "Toasted garlic bread finished with mozzarella.", 199)
                    )
            ),
            new Restaurant(
                    "green-bowl",
                    "Green Bowl Co.",
                    "Healthy, Salads",
                    "4.7 ★",
                    "20-25 min",
                    "₹350 for two",
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
                    "Fresh grain bowls, salads, and nourishing meals made for busy days.",
                    List.of(
                            new MenuItem("protein-bowl", "Protein Power Bowl", "Quinoa, roasted vegetables, chickpeas, and tahini.", 349),
                            new MenuItem("avocado-salad", "Avocado Garden Salad", "Crisp greens, avocado, corn, and citrus dressing.", 299)
                    )
            )
    );

    public List<Restaurant> findAll() {
        return restaurants;
    }

    public Optional<Restaurant> findById(String id) {
        return restaurants.stream()
                .filter(restaurant -> restaurant.id().equals(id))
                .findFirst();
    }
}
