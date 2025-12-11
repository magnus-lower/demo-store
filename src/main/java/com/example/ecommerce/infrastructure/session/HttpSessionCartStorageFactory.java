package com.example.ecommerce.infrastructure.session;

import com.example.ecommerce.application.session.CartStorage;
import com.example.ecommerce.application.session.CartStorageFactory;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

@Component
public class HttpSessionCartStorageFactory implements CartStorageFactory {

    @Override
    public CartStorage forSession(HttpSession session) {
        return new HttpSessionCartStorage(session);
    }

    private static class HttpSessionCartStorage implements CartStorage {
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
            return (java.util.List<java.util.Map<String, Object>>) cartObject;
        }

        @Override
        public void writeCart(java.util.List<java.util.Map<String, Object>> cart) {
            session.setAttribute(CART_SESSION_KEY, cart);
        }

        @Override
        public void clearCart() {
            session.removeAttribute(CART_SESSION_KEY);
        }
    }
}
