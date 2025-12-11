package com.example.ecommerce.web.order.dto;

import com.example.ecommerce.domain.model.OrderStatus;
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
