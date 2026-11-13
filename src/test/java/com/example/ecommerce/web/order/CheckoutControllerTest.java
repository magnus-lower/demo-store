package com.example.ecommerce.web.order;

import com.example.ecommerce.application.service.OrderService;
import com.example.ecommerce.domain.model.*;
import com.example.ecommerce.infrastructure.session.CartStorageFactory;
import com.example.ecommerce.web.order.dto.CheckoutRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CheckoutControllerTest {
    @Test
    void cleanupFailureCannotTurnAConfirmedOrderIntoAnError() {
        OrderService service = mock(OrderService.class);
        CartStorageFactory storage = mock(CartStorageFactory.class);
        Order order = new Order();
        order.setOrderNumber("DEMO1234"); order.setTotalAmount(new BigDecimal("59.00"));
        when(service.createOrder(anyLong(), any(), anyMap(), any())).thenReturn(order);
        when(storage.forSession(any())).thenThrow(new IllegalStateException("Session unavailable"));
        User user = new User(); user.setId(1L);
        CheckoutRequestDto request = new CheckoutRequestDto();
        request.setRequestId(UUID.randomUUID()); request.setItems(Map.of(1L, 1));
        var response = new CheckoutController(service, storage).checkout(user, request, new MockHttpSession());
        assertThat(response.getOrderNumber()).isEqualTo("DEMO1234");
        assertThat(response.getTotalAmount()).isEqualByComparingTo("59.00");
        verify(service, times(1)).createOrder(anyLong(), any(), anyMap(), any());
    }
}
