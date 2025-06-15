package com.example.ecommerce.service;

import com.example.ecommerce.model.Product;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Service
public class ProductService {

    public List<Product> getProducts() {
        List<Product> products = new ArrayList<>();
        products.add(new Product(1L, "Flaske", "En drikkeflaske som kan brukes til alle formål", new BigDecimal("10.99"), "/images/Bottle.jpg", "Mat og drikke", 10));
        products.add(new Product(2L, "Solbriller", "Solbriller som passer perfekt til alle", new BigDecimal("12.99"), "/images/Sunglasses.jpg", "Klær", 15));
        products.add(new Product(3L, "Potteplante", "En potteplante som passer til alle typer planter", new BigDecimal("15.99"), "/images/Plant pot.jpg", "Møbler", 8));
        return products;
    }
}