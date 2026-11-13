package com.example.ecommerce.application.service;

import com.example.ecommerce.domain.exception.InsufficientStockException;
import com.example.ecommerce.domain.exception.ProductNotFoundException;
import com.example.ecommerce.domain.model.*;
import com.example.ecommerce.domain.repository.OrderRepository;
import com.example.ecommerce.domain.repository.ProductRepository;
import com.example.ecommerce.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(Long userId, UUID requestId, Map<Long, Integer> productQuantities, Address shippingAddress) {
        User user = userRepository.findForCheckoutById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var existing = orderRepository.findByUserIdAndCheckoutRequestId(userId, requestId);
        if (existing.isPresent()) {
            Order previous = existing.get();
            Map<Long, Integer> previousItems = previous.getItems().stream().collect(
                    Collectors.toMap(item -> item.getProduct().getId(), OrderItem::getQuantity));
            Address address = previous.getShippingAddress();
            if (!previousItems.equals(productQuantities)
                    || !Objects.equals(address.getStreet(), shippingAddress.getStreet())
                    || !Objects.equals(address.getCity(), shippingAddress.getCity())
                    || !Objects.equals(address.getZipCode(), shippingAddress.getZipCode())
                    || !Objects.equals(address.getCountry(), shippingAddress.getCountry())) {
                throw new IllegalArgumentException("A checkout request ID cannot be reused for a different order");
            }
            return previous;
        }

        Order order = new Order();
        order.setCheckoutRequestId(requestId);
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
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

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
        return orderRepository.saveAndFlush(order);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    private String generateOrderNumber() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}