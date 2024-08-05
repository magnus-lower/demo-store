package com.example.ecommerce.model;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class Product {
    // Getters and Setters
    private Long id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private String category;

    // Constructors
    public Product() {}

    public Product(Long id, String name, String description, double price, String imageUrl, String category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
    }
}