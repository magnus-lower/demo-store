package com.example.ecommerce.application.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce.domain.model.Product;
import com.example.ecommerce.domain.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getProducts() {
        List<Product> products = productRepository.findAll();
        log.debug("Found {} products in database", products.size());
        return products;
    }
}