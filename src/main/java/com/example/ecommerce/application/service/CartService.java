package com.example.ecommerce.application.service;

import com.example.ecommerce.domain.exception.InsufficientStockException;
import com.example.ecommerce.application.session.CartStoragePort;
import com.example.ecommerce.domain.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {
    private final ProductService productService;

    public List<Map<String, Object>> getCart(CartStoragePort cartStorage) {
        return cartStorage.readCart();
    }

    public List<Map<String, Object>> addToCart(Long productId, Integer quantity, CartStoragePort cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);

        if (quantity == 0 || quantity < -1000 || quantity > 1000) {
            throw new IllegalArgumentException("Invalid quantity");
        }
        Product product = productService.getProduct(productId);

        boolean found = false;
        for (Map<String, Object> item : cart) {
            Long itemId = Long.valueOf(item.get("id").toString());
            if (itemId.equals(productId)) {
                int newQuantity = Math.addExact((Integer) item.get("quantity"), quantity);
                validateQuantity(newQuantity, product);
                if (newQuantity <= 0) {
                    return removeFromCart(productId, cartStorage);
                }
                item.put("quantity", newQuantity);
                found = true;
                break;
            }
        }

        if (!found && quantity > 0) {
            validateQuantity(quantity, product);
            Map<String, Object> item = new HashMap<>();
            item.put("id", product.getId());
            item.put("name", product.getName());
            item.put("price", product.getPrice());
            item.put("imageUrl", product.getImageUrl());
            item.put("quantity", quantity);
            cart.add(item);
        }

        cartStorage.writeCart(cart);
        return cart;
    }

    private void validateQuantity(int quantity, Product product) {
        if (quantity > 1000) {
            throw new IllegalArgumentException("Quantity exceeds the demo limit");
        }
        if (quantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Not enough stock");
        }
    }

    public List<Map<String, Object>> removeFromCart(Long productId, CartStoragePort cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);
        cart.removeIf(item -> {
            Long itemId = Long.valueOf(item.get("id").toString());
            return itemId.equals(productId);
        });
        cartStorage.writeCart(cart);
        return cart;
    }

    public List<Map<String, Object>> clearCart(CartStoragePort cartStorage) {
        cartStorage.clearCart();
        return new ArrayList<>();
    }

    public List<Map<String, Object>> updateCartItemQuantity(Long productId, Integer quantity, CartStoragePort cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);

        for (Map<String, Object> item : cart) {
            Long itemId = Long.valueOf(item.get("id").toString());
            if (itemId.equals(productId)) {
                if (quantity <= 0) {
                    return removeFromCart(productId, cartStorage);
                }
                validateQuantity(quantity, productService.getProduct(productId));
                item.put("quantity", quantity);
                break;
            }
        }

        cartStorage.writeCart(cart);
        return cart;
    }
}
