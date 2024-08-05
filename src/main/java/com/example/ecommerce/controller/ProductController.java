package com.example.ecommerce.controller;

import com.example.ecommerce.model.Product;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ProductController {

    @GetMapping("/api/products")
    public List<Product> getProducts() {
        List<Product> products = new ArrayList<>();
        products.add(new Product(1L, "Bottle", "A bottle which is large", 10.99, "/images/Bottle.jpg"));
        products.add(new Product(2L, "Sunglasses", "Very cool sunglasses", 12.99, "/images/Sunglasses.jpg"));
        products.add(new Product(3L, "Plant pot", "A plant pot which fits almost every type of plant", 15.99, "/images/Plant pot.jpg"));
        return products;
    }
}
