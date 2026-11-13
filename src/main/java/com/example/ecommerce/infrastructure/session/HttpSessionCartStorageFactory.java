package com.example.ecommerce.infrastructure.session;

import com.example.ecommerce.application.session.CartStoragePort;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

@Component
public class HttpSessionCartStorageFactory implements CartStorageFactory {

    @Override
    public CartStoragePort forSession(HttpSession session) {
        return new HttpSessionCartStorage(session);
    }

    private static class HttpSessionCartStorage implements CartStoragePort {
        private static final String CART_SESSION_KEY = "cart";
        private final HttpSession session;

        private HttpSessionCartStorage(HttpSession session) {
            this.session = session;
        }

        @Override
        @SuppressWarnings("unchecked")
        public java.util.List<java.util.Map<String, Object>> readCart() {
            Object cartObject = session.getAttribute(CART_SESSION_KEY);
            if (cartObject == null) {
                return new java.util.ArrayList<>();
            }
            return snapshot((java.util.List<java.util.Map<String, Object>>) cartObject);
        }

        @Override
        public void writeCart(java.util.List<java.util.Map<String, Object>> cart) {
            session.setAttribute(CART_SESSION_KEY, snapshot(cart));
        }

        private java.util.List<java.util.Map<String, Object>> snapshot(
                java.util.List<java.util.Map<String, Object>> cart) {
            return cart.stream().map(item -> (java.util.Map<String, Object>)
                    new java.util.HashMap<String, Object>(item))
                    .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
        }

        @Override
        public void clearCart() {
            session.removeAttribute(CART_SESSION_KEY);
        }
    }
}
