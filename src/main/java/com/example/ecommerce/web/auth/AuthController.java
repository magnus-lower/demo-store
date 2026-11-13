package com.example.ecommerce.web.auth;

import org.springframework.security.authentication.BadCredentialsException;
import com.example.ecommerce.web.exception.ApiError;
import com.example.ecommerce.web.auth.dto.AuthResponseDto;
import com.example.ecommerce.web.auth.dto.LoginRequestDto;
import com.example.ecommerce.web.auth.dto.PasswordResetRequestDto;
import com.example.ecommerce.web.auth.dto.RegisterRequestDto;
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
import java.util.Map;
import java.nio.charset.StandardCharsets;

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
        if (request.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            return ResponseEntity.badRequest().body(new ApiError(
                    "Kontroller feltene du har fylt ut.", Map.of("password", "Passordet kan være maksimalt 72 UTF-8-byte.")));
        }
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

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Kontoen er opprettet."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto request) {
        if (request.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadCredentialsException("Invalid credentials");
        }
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
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of("message", "Tilbakestilling av passord er ikke tilgjengelig i denne demoen. Ingen e-post er sendt."));
    }
}
