package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CheckoutRequestDto;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.model.Address;
import com.example.ecommerce.model.Order;
import com.example.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequestDto request) {
        try {
            Long userId = ((com.example.ecommerce.model.User) userDetails).getId();

            Address shippingAddress = new Address();
            shippingAddress.setStreet(request.getStreet());
            shippingAddress.setCity(request.getCity());
            shippingAddress.setZipCode(request.getZipCode());
            shippingAddress.setCountry(request.getCountry());

            Order order = orderService.createOrder(userId, request.getItems(), shippingAddress);

            OrderResponseDto response = new OrderResponseDto();
            response.setOrderNumber(order.getOrderNumber());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());

            return ResponseEntity.ok(response);
        } catch (InsufficientStockException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during checkout");
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((com.example.ecommerce.model.User) userDetails).getId();
        List<Order> orders = orderService.getUserOrders(userId);

        List<OrderResponseDto> response = orders.stream()
            .map(order -> {
                OrderResponseDto dto = new OrderResponseDto();
                dto.setOrderNumber(order.getOrderNumber());
                dto.setOrderDate(order.getOrderDate());
                dto.setStatus(order.getStatus());
                dto.setTotalAmount(order.getTotalAmount());
                return dto;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}