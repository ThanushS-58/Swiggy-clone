package com.example.foodordering;

public record MenuItem(
        String id,
        String name,
        String description,
        int price
) {
}
