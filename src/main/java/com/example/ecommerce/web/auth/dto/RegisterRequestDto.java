package com.example.ecommerce.web.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {
    @NotBlank(message = "E-postadresse er påkrevd")
    @Email(message = "Oppgi en gyldig e-postadresse")
    @jakarta.validation.constraints.Size(max = 254)
    private String email;

    @NotBlank(message = "Passord er påkrevd")
    @Size(min = 8, message = "Passordet må inneholde minst 8 tegn")
    @Pattern(regexp = ".*[A-Z].*", message = "Passordet må inneholde minst én stor bokstav")
    @Pattern(regexp = ".*[a-z].*", message = "Passordet må inneholde minst én liten bokstav")
    @Pattern(regexp = ".*\\d.*", message = "Passordet må inneholde minst ett tall")
    private String password;

    @NotBlank(message = "Fornavn er påkrevd")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Etternavn er påkrevd")
    @Size(max = 100)
    private String lastName;
}
