package com.example.ecommerce.service;

import com.example.ecommerce.model.Product;
import jakarta.servlet.http.HttpSession;
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

    private static final String CART_SESSION_KEY = "cart";

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCart(HttpSession session) {
        Object cartObject = session.getAttribute(CART_SESSION_KEY);
        if (cartObject == null) {
            return new ArrayList<>();
        }
        return (List<Map<String, Object>>) cartObject;
    }

    public List<Map<String, Object>> addToCart(Long productId, Integer quantity, HttpSession session) {
        List<Map<String, Object>> cart = getCart(session);

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
                    return removeFromCart(productId, session);
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
            // Convert BigDecimal to double to avoid serialization issues
            item.put("price", product.getPrice().doubleValue());
            item.put("imageUrl", product.getImageUrl());
            item.put("quantity", quantity);
            cart.add(item);
        }

        session.setAttribute(CART_SESSION_KEY, cart);
        return cart;
    }

    public List<Map<String, Object>> removeFromCart(Long productId, HttpSession session) {
        List<Map<String, Object>> cart = getCart(session);
        cart.removeIf(item -> {
            Long itemId = Long.valueOf(item.get("id").toString());
            return itemId.equals(productId);
        });
        session.setAttribute(CART_SESSION_KEY, cart);
        return cart;
    }

    public List<Map<String, Object>> clearCart(HttpSession session) {
        session.removeAttribute(CART_SESSION_KEY);
        return new ArrayList<>();
    }

    public List<Map<String, Object>> updateCartItemQuantity(Long productId, Integer quantity, HttpSession session) {
        List<Map<String, Object>> cart = getCart(session);

        for (Map<String, Object> item : cart) {
            Long itemId = Long.valueOf(item.get("id").toString());
            if (itemId.equals(productId)) {
                if (quantity <= 0) {
                    return removeFromCart(productId, session);
                }
                item.put("quantity", quantity);
                break;
            }
        }

        session.setAttribute(CART_SESSION_KEY, cart);
        return cart;
    }
}