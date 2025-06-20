package com.example.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDto {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}