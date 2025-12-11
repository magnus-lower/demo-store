package com.example.ecommerce.application.session;

import java.util.List;
import java.util.Map;

public interface CartStoragePort {
    List<Map<String, Object>> readCart();

    void writeCart(List<Map<String, Object>> cart);

    void clearCart();
}
