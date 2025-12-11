package com.example.ecommerce.application.service;

import com.example.ecommerce.domain.model.Product;
import com.example.ecommerce.domain.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void getProductsReturnsRepositoryResults() {
        Product product = new Product(1L, "Test", "Desc", new BigDecimal("10.00"), "http://example.com", "Category", 5);
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<Product> results = productService.getProducts();

        assertThat(results).containsExactly(product);
    }
}
