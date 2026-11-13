package com.example.ecommerce.web.cart;

import com.example.ecommerce.application.service.*;
import com.example.ecommerce.domain.model.Product;
import com.example.ecommerce.infrastructure.session.HttpSessionCartStorageFactory;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class CartConcurrencyTest {
    @Test
    void parallelUpdatesArePreservedAndResponsesAreSnapshots() throws Exception {
        ProductService products = mock(ProductService.class);
        when(products.getProduct(1L)).thenReturn(new Product(1L, "Demo", "", BigDecimal.TEN, "/images/belt.jpg", "Klær", 1000));
        CartController controller = new CartController(new CartService(products), new HttpSessionCartStorageFactory());
        MockHttpSession session = new MockHttpSession();
        var snapshot = controller.addToCart(1L, 1, session);
        ExecutorService executor = Executors.newFixedThreadPool(4);
        try {
            var requests = new ArrayList<Callable<Void>>();
            for (int i = 0; i < 100; i++) requests.add(() -> { controller.addToCart(1L, 1, session); return null; });
            for (var future : executor.invokeAll(requests)) future.get(10, TimeUnit.SECONDS);
            assertThat(controller.getCart(session).get(0).get("quantity")).isEqualTo(101);
            assertThat(snapshot.get(0).get("quantity")).isEqualTo(1);
            verify(products, never()).getProducts();
        } finally {
            executor.shutdownNow();
        }
    }
}
