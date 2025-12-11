package com.example.ecommerce.web.controller;

import com.example.ecommerce.application.service.ProductService;
import com.example.ecommerce.domain.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @RequestMapping(value = "/api/products", method = RequestMethod.GET)
    public List<Product> getProducts() {
        logger.info("Fetching all products");
        return productService.getProducts();
    }
}