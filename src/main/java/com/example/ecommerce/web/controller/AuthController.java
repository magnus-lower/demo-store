package com.example.ecommerce.web.controller;

import com.example.ecommerce.web.dto.AuthResponseDto;
import com.example.ecommerce.web.dto.LoginRequestDto;
import com.example.ecommerce.web.dto.PasswordResetRequestDto;
import com.example.ecommerce.web.dto.RegisterRequestDto;
import com.example.ecommerce.domain.exception.UserAlreadyExistsException;
import com.example.ecommerce.domain.model.User;
import com.example.ecommerce.infrastructure.security.JwtUtil;
import com.example.ecommerce.application.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRoles(Collections.singleton("USER"));

        userService.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);

        AuthResponseDto response = new AuthResponseDto();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDto request) {
        // In a real app, you would:
        // 1. Verify user exists
        // 2. Generate a reset token and store it
        // 3. Send an email with a reset link containing the token

        if (userService.findByEmail(request.getEmail()).isPresent()) {
            // For demo purposes, we'll just indicate success
            return ResponseEntity.ok("Password reset link sent to your email");
        } else {
            return ResponseEntity.ok("If your email exists in our system, you will receive a reset link");
        }
    }
}