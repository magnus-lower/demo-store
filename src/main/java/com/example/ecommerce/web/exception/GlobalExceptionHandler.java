package com.example.ecommerce.web.exception;

import com.example.ecommerce.domain.exception.InsufficientStockException;
import com.example.ecommerce.domain.exception.ProductNotFoundException;
import com.example.ecommerce.domain.exception.UserAlreadyExistsException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error ->
                errors.putIfAbsent(error instanceof FieldError field ? field.getField() : "request",
                        error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ApiError("Kontroller feltene du har fylt ut.", errors));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, HandlerMethodValidationException.class,
            ConstraintViolationException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiError> invalidRequest(Exception ex) {
        return ResponseEntity.badRequest().body(new ApiError("Ugyldig forespørsel. Kontroller opplysningene og prøv igjen."));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> authentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("Ugyldig e-postadresse eller passord."));
    }

    @ExceptionHandler({ProductNotFoundException.class, org.springframework.web.servlet.resource.NoResourceFoundException.class,
            org.springframework.web.servlet.NoHandlerFoundException.class})
    public ResponseEntity<ApiError> notFound(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("Fant ikke det du ba om."));
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiError> stock(InsufficientStockException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("Det er ikke nok varer på lager til ønsket antall."));
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> concurrentCheckout(OptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("Lagerbeholdningen ble endret. Kontroller handlekurven og prøv igjen."));
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiError> duplicateEmail(UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("E-postadressen er allerede i bruk."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> dataConflict(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("Forespørselen kunne ikke fullføres. Last inn siden på nytt og prøv igjen."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception ex) {
        log.error("Unexpected request failure", ex);
        return ResponseEntity.internalServerError()
                .body(new ApiError("Det oppstod en uventet feil. Prøv igjen."));
    }
}
