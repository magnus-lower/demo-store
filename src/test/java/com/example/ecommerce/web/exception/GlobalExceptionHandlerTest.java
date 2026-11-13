package com.example.ecommerce.web.exception;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {
    @Test
    void unexpectedErrorsDoNotExposeInternalDetails() {
        var response = new GlobalExceptionHandler().unexpected(new IllegalStateException("private database details"));
        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(response.getBody().message()).doesNotContain("private", "database");
    }
}
