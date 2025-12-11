package com.example.ecommerce.web.auth.dto;

import lombok.Data;

@Data
public class AuthResponseDto {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
}
