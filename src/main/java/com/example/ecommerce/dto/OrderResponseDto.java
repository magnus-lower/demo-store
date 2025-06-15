package com.example.ecommerce.dto;

import com.example.ecommerce.model.OrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderResponseDto {
    private String orderNumber;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal totalAmount;
}