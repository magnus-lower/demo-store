package com.example.ecommerce.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey signingKey;
    private final long expiration;

    public JwtUtil(@Value("${jwt.secret:}") String secret,
                   @Value("${jwt.expiration:86400000}") long expiration,
                   Environment environment) {
        if (secret.isBlank() && environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            signingKey = Jwts.SIG.HS256.key().build();
        } else {
            if (secret.isBlank() || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
                throw new IllegalStateException("Configure JWT_SECRET with at least 32 random bytes.");
            }
            signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
        this.expiration = expiration;
    }

    public String extractUsername(String token) {
        return claims(token).getSubject();
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(claims(token).getSubject());
    }
}
