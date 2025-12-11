package com.example.ecommerce.application.session;

import jakarta.servlet.http.HttpSession;

public interface CartStorageFactory {
    CartStorage forSession(HttpSession session);
}
