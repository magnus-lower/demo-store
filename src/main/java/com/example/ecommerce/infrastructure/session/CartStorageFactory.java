package com.example.ecommerce.infrastructure.session;

import com.example.ecommerce.application.session.CartStoragePort;
import jakarta.servlet.http.HttpSession;

public interface CartStorageFactory {
    CartStoragePort forSession(HttpSession session);
}
