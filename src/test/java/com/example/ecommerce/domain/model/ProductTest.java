package com.example.ecommerce.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    void applyDiscountReducesPrice() {
        Product product = new Product(1L, "Test", "Desc", new BigDecimal("100.00"), "http://example.com", "Category", 10);

        product.applyDiscount(10);

        assertEquals(0, product.getPrice().compareTo(new BigDecimal("90.00")));
    }

    @Test
    void decreaseStockReducesQuantity() {
        Product product = new Product(1L, "Test", "Desc", new BigDecimal("20.00"), "http://example.com", "Category", 5);

        product.decreaseStock(2);

        assertEquals(3, product.getStockQuantity());
    }

    @Test
    void isInStockReturnsTrueWhenQuantityPositive() {
        Product product = new Product(1L, "Test", "Desc", new BigDecimal("20.00"), "http://example.com", "Category", 1);

        assertTrue(product.isInStock());
    }
}
