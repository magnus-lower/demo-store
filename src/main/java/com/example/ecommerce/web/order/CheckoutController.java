package com.example.ecommerce.web.order;

import com.example.ecommerce.application.service.OrderService;
import com.example.ecommerce.domain.model.Address;
import com.example.ecommerce.domain.model.Order;
import com.example.ecommerce.domain.model.User;
import com.example.ecommerce.infrastructure.session.CartStorageFactory;
import com.example.ecommerce.web.order.dto.CheckoutRequestDto;
import com.example.ecommerce.web.order.dto.OrderResponseDto;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final OrderService orderService;
    private final CartStorageFactory cartStorageFactory;

    @PostMapping
    public OrderResponseDto checkout(@AuthenticationPrincipal User user,
                                    @Valid @RequestBody CheckoutRequestDto request,
                                    HttpSession session) {
        Address address = new Address();
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());

        synchronized (session) {
            // The service transaction commits before optional session cleanup.
            Order order = orderService.createOrder(user.getId(), request.getRequestId(), request.getItems(), address);
            try {
                cartStorageFactory.forSession(session).clearCart();
            } catch (RuntimeException ex) {
                log.warn("Order {} succeeded, but session cart cleanup failed", order.getOrderNumber(), ex);
            }
            return response(order);
        }
    }

    @GetMapping("/orders")
    public List<OrderResponseDto> getUserOrders(@AuthenticationPrincipal User user) {
        return orderService.getUserOrders(user.getId()).stream().map(this::response).toList();
    }

    private OrderResponseDto response(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setOrderNumber(order.getOrderNumber());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        return dto;
    }
}
