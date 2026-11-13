package com.example.ecommerce.infrastructure.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.core.userdetails.User;
import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {
    @Test
    void missingOrShortProductionSecretFailsClosed() {
        assertThatThrownBy(() -> new JwtUtil("", 60000, new MockEnvironment()))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("JWT_SECRET");
        assertThatThrownBy(() -> new JwtUtil("short", 60000, new MockEnvironment()))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void developmentKeysAreRandomAndTokensAreVerified() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("dev");
        JwtUtil first = new JwtUtil("", 60000, environment);
        JwtUtil second = new JwtUtil("", 60000, environment);
        var user = User.withUsername("demo@example.com").password("unused").roles("USER").build();
        String token = first.generateToken(user);
        assertThat(first.validateToken(token, user)).isTrue();
        assertThatThrownBy(() -> second.extractUsername(token)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> first.extractUsername(token + "tampered")).isInstanceOf(JwtException.class);
    }
    @Test
    void expiredTokensAreRejected() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("test");
        JwtUtil expired = new JwtUtil("", -1000, environment);
        var user = User.withUsername("demo@example.com").password("unused").roles("USER").build();
        assertThatThrownBy(() -> expired.extractUsername(expired.generateToken(user)))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
