package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CheckoutRequestDto;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.model.Address;
import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.User;
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
            System.out.println("Checkout request received");
            System.out.println("User details: " + userDetails);
            System.out.println("Request: " + request);

            if (userDetails == null) {
                System.out.println("User details is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            if (!(userDetails instanceof User)) {
                System.out.println("User details is not instance of User: " + userDetails.getClass());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid user type");
            }

            User user = (User) userDetails;
            Long userId = user.getId();
            System.out.println("User ID: " + userId);

            if (request.getItems() == null || request.getItems().isEmpty()) {
                System.out.println("No items in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No items to order");
            }

            Address shippingAddress = new Address();
            shippingAddress.setStreet(request.getStreet());
            shippingAddress.setCity(request.getCity());
            shippingAddress.setZipCode(request.getZipCode());
            shippingAddress.setCountry(request.getCountry());

            System.out.println("Creating order with items: " + request.getItems());
            Order order = orderService.createOrder(userId, request.getItems(), shippingAddress);
            System.out.println("Order created: " + order.getOrderNumber());

            OrderResponseDto response = new OrderResponseDto();
            response.setOrderNumber(order.getOrderNumber());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());
            response.setStatus(order.getStatus());

            return ResponseEntity.ok(response);
        } catch (InsufficientStockException e) {
            System.out.println("Insufficient stock: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("Error during checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during checkout: " + e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            if (!(userDetails instanceof User)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid user type");
            }

            Long userId = ((User) userDetails).getId();
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
        } catch (Exception e) {
            System.out.println("Error fetching orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching orders: " + e.getMessage());
        }
    }
}