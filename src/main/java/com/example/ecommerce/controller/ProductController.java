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
        products.add(new Product(1L, "Product 1", "Description 1", 10.99, "/images/product1.jpg"));
        products.add(new Product(2L, "Product 2", "Description 2", 12.99, "/images/product2.jpg"));
        products.add(new Product(3L, "Product 3", "Description 3", 15.99, "/images/product3.jpg"));
        return products;
    }
}
