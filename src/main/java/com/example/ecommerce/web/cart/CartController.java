package com.example.ecommerce.web.cart;

import com.example.ecommerce.application.service.CartService;
import com.example.ecommerce.infrastructure.session.CartStorageFactory;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final CartStorageFactory cartStorageFactory;

    @GetMapping
    public List<Map<String, Object>> getCart(HttpSession session) {
        synchronized (session) {
            return cartService.getCart(cartStorageFactory.forSession(session));
        }
    }

    @PostMapping("/add")
    public List<Map<String, Object>> addToCart(@RequestParam @Positive Long productId,
                                              @RequestParam @Min(-1000) @Max(1000) Integer quantity,
                                              HttpSession session) {
        synchronized (session) {
            return cartService.addToCart(productId, quantity, cartStorageFactory.forSession(session));
        }
    }

    @PostMapping("/remove")
    public List<Map<String, Object>> removeFromCart(@RequestParam @Positive Long productId, HttpSession session) {
        synchronized (session) {
            return cartService.removeFromCart(productId, cartStorageFactory.forSession(session));
        }
    }

    @PostMapping("/clear")
    public List<Map<String, Object>> clearCart(HttpSession session) {
        synchronized (session) {
            return cartService.clearCart(cartStorageFactory.forSession(session));
        }
    }
}
