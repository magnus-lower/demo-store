package com.example.ecommerce.web.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDto {
    @NotBlank(message = "E-postadresse er påkrevd")
    @Email(message = "Oppgi en gyldig e-postadresse")
    @jakarta.validation.constraints.Size(max = 254)
    private String email;
}
