package com.example.ecommerce.controller;

import com.example.ecommerce.service.CartService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public List<Map<String, Object>> getCart(HttpSession session) {
        return cartService.getCart(session);
    }

    @PostMapping("/add")
    public List<Map<String, Object>> addToCart(@RequestParam Long productId,
                                              @RequestParam Integer quantity,
                                              HttpSession session) {
        return cartService.addToCart(productId, quantity, session);
    }

    @PostMapping("/remove")
    public List<Map<String, Object>> removeFromCart(@RequestParam Long productId, HttpSession session) {
        return cartService.removeFromCart(productId, session);
    }

    @PostMapping("/clear")
    public List<Map<String, Object>> clearCart(HttpSession session) {
        cartService.clearCart(session);
        return cartService.getCart(session);
    }
}