package com.example.ecommerce.domain.model;

import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Setter
@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Name cannot be null")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    @Column(nullable = false)
    private BigDecimal price;

    @Pattern(regexp = "^(https?://[^/]+/|/images/)[^<>\"]*$", message = "Image URL must be an HTTP(S) URL or a local image path")
    @Column(name = "image_url")
    private String imageUrl;

    @NotNull(message = "Category cannot be null")
    @Column(nullable = false)
    private String category;

    @NotNull
    @Min(0)
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Version
    @Setter(AccessLevel.NONE)
    private Long version;

    public Product(Long id, String name, String description, BigDecimal price,
                   String imageUrl, String category, Integer stockQuantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
        this.stockQuantity = stockQuantity;
    }

    public void applyDiscount(double percentage) {
        if (percentage > 0 && percentage <= 100) {
            BigDecimal discountAmount = price.multiply(BigDecimal.valueOf(percentage / 100.0));
            this.price = this.price.subtract(discountAmount);
        }
    }

    public boolean isInStock() {
        return stockQuantity > 0;
    }

    public void decreaseStock(int quantity) {
        if (quantity > 0 && stockQuantity >= quantity) {
            stockQuantity -= quantity;
        } else {
            throw new IllegalArgumentException("Not enough stock available");
        }
    }
}