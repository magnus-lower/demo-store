package com.example.ecommerce.web.cart;

import com.example.ecommerce.application.service.CartService;
import com.example.ecommerce.application.session.CartStorage;
import com.example.ecommerce.infrastructure.session.CartStorageFactory;
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
    private final CartStorageFactory cartStorageFactory;

    @GetMapping
    public List<Map<String, Object>> getCart(HttpSession session) {
        return cartService.getCart(resolveCartStorage(session));
    }

    @PostMapping("/add")
    public List<Map<String, Object>> addToCart(@RequestParam Long productId,
                                              @RequestParam Integer quantity,
                                              HttpSession session) {
        return cartService.addToCart(productId, quantity, resolveCartStorage(session));
    }

    @PostMapping("/remove")
    public List<Map<String, Object>> removeFromCart(@RequestParam Long productId, HttpSession session) {
        return cartService.removeFromCart(productId, resolveCartStorage(session));
    }

    @PostMapping("/clear")
    public List<Map<String, Object>> clearCart(HttpSession session) {
        CartStorage cartStorage = resolveCartStorage(session);
        cartService.clearCart(cartStorage);
        return cartService.getCart(cartStorage);
    }

    private CartStorage resolveCartStorage(HttpSession session) {
        return cartStorageFactory.forSession(session);
    }
}
