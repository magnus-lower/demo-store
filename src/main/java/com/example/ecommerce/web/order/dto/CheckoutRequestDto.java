package com.example.ecommerce.web.order.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class CheckoutRequestDto {
    @NotNull
    private UUID requestId;
    @NotBlank @Size(max = 150)
    private String street;
    @NotBlank @Size(max = 100)
    private String city;
    @NotBlank @Size(max = 20)
    private String zipCode;
    @NotBlank @Size(max = 100)
    private String country;
    @NotEmpty @Size(max = 100)
    private Map<@NotNull @Positive Long, @NotNull @Positive @Max(1000) Integer> items;
}
