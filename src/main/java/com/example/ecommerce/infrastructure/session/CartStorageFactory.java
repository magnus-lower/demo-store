package com.example.ecommerce.infrastructure.session;

import com.example.ecommerce.application.session.CartStorage;
import jakarta.servlet.http.HttpSession;

public interface CartStorageFactory {
    CartStorage forSession(HttpSession session);
}
