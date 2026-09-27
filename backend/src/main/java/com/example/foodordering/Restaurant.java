package com.example.foodordering;

import java.util.List;

public record Restaurant(
        String id,
        String name,
        String cuisine,
        String rating,
        String deliveryTime,
        String priceRange,
        String image,
        String description,
        List<MenuItem> menu
) {
}
