package com.example.ecommerce.service;

import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(Long userId, Map<Long, Integer> productQuantities, Address shippingAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(shippingAddress);
        order.setShippingCost(new BigDecimal("49.00"));

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

            if (product.getStockQuantity() < quantity) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName());
            }

            // Decrease stock
            product.decreaseStock(quantity);
            productRepository.save(product);

            // Create order item
            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPrice(product.getPrice());

            order.addOrderItem(item);
            totalAmount = totalAmount.add(item.getSubtotal());
        }

        order.setTotalAmount(totalAmount.add(order.getShippingCost()));
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    private String generateOrderNumber() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}