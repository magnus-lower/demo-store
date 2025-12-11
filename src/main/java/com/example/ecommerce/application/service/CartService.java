package com.example.ecommerce.application.service;

import com.example.ecommerce.application.session.CartStorage;
import com.example.ecommerce.domain.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {
    private final ProductService productService;

    public List<Map<String, Object>> getCart(CartStorage cartStorage) {
        return cartStorage.readCart();
    }

    public List<Map<String, Object>> addToCart(Long productId, Integer quantity, CartStorage cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);

        Product product = productService.getProducts().stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        boolean found = false;
        for (Map<String, Object> item : cart) {
            Long itemId = Long.valueOf(item.get("id").toString());
            if (itemId.equals(productId)) {
                int newQuantity = (Integer) item.get("quantity") + quantity;
                if (newQuantity <= 0) {
                    return removeFromCart(productId, cartStorage);
                }
                item.put("quantity", newQuantity);
                found = true;
                break;
            }
        }

        if (!found && quantity > 0) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", product.getId());
            item.put("name", product.getName());
            item.put("price", product.getPrice().doubleValue());
            item.put("imageUrl", product.getImageUrl());
            item.put("quantity", quantity);
            cart.add(item);
        }

        cartStorage.writeCart(cart);
        return cart;
    }

    public List<Map<String, Object>> removeFromCart(Long productId, CartStorage cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);
        cart.removeIf(item -> {
            Long itemId = Long.valueOf(item.get("id").toString());
            return itemId.equals(productId);
        });
        cartStorage.writeCart(cart);
        return cart;
    }

    public List<Map<String, Object>> clearCart(CartStorage cartStorage) {
        cartStorage.clearCart();
        return new ArrayList<>();
    }

    public List<Map<String, Object>> updateCartItemQuantity(Long productId, Integer quantity, CartStorage cartStorage) {
        List<Map<String, Object>> cart = getCart(cartStorage);

        for (Map<String, Object> item : cart) {
            Long itemId = Long.valueOf(item.get("id").toString());
            if (itemId.equals(productId)) {
                if (quantity <= 0) {
                    return removeFromCart(productId, cartStorage);
                }
                item.put("quantity", quantity);
                break;
            }
        }

        cartStorage.writeCart(cart);
        return cart;
    }
}