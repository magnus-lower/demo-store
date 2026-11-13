package com.example.ecommerce.integration;

import com.example.ecommerce.application.service.OrderService;
import com.example.ecommerce.domain.exception.InsufficientStockException;
import com.example.ecommerce.domain.model.*;
import com.example.ecommerce.domain.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:flows;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orders;
    @Autowired PasswordEncoder passwords;
    @Autowired OrderService orderService;
    @Autowired PlatformTransactionManager transactions;
    Product product;

    @BeforeEach
    void reset() {
        orders.deleteAll();
        users.deleteAll();
        products.deleteAll();
        product = products.saveAndFlush(new Product(null, "Demo product", "Description", new BigDecimal("10.00"),
                "/images/belt.jpg", "Klær", 5));
    }

    @Test
    void authenticationAndRegistrationErrorsHaveConsistentStatusAndJson() throws Exception {
        var registration = Map.of("firstName", "Demo", "lastName", "User", "email", "demo@example.com", "password", "DemoPass1");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(registration)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.message").exists());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(registration)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("E-postadressen er allerede i bruk."));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", "demo@example.com", "password", "WrongPass1"))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Ugyldig e-postadresse eller passord."));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.email").exists());
        mvc.perform(post("/api/checkout").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").exists());
        mvc.perform(get("/api/checkout/orders").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
        String token = login("demo@example.com");
        mvc.perform(get("/api/checkout/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void cartAndCheckoutValidationReturnClientErrors() throws Exception {
        mvc.perform(post("/api/cart/add").param("productId", "999999").param("quantity", "1"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.message").exists());
        for (String id : List.of("-1", "invalid")) {
            mvc.perform(post("/api/cart/add").param("productId", id).param("quantity", "1"))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/cart/add").param("productId", product.getId().toString()).param("quantity", "0"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/cart/add").param("productId", product.getId().toString()).param("quantity", "6"))
                .andExpect(status().isConflict());
        createUser("buyer@example.com");
        String token = login("buyer@example.com");
        List<Map<Long, Integer>> invalidItems = new ArrayList<>();
        invalidItems.add(Map.of());
        invalidItems.add(Map.of(0L, 1));
        for (Integer quantity : Arrays.asList(0, -1, null)) {
            Map<Long, Integer> item = new HashMap<>();
            item.put(product.getId(), quantity);
            invalidItems.add(item);
        }
        for (var items : invalidItems) {
            var request = checkout(UUID.randomUUID());
            request.put("items", items);
            mvc.perform(post("/api/checkout").header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
        var blankAddress = checkout(UUID.randomUUID());
        blankAddress.put("street", "   ");
        mvc.perform(post("/api/checkout").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(blankAddress)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.street").exists());
        mvc.perform(post("/api/checkout").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
        var missing = checkout(UUID.randomUUID());
        missing.put("items", Map.of(999999, 1));
        mvc.perform(post("/api/checkout").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(missing)))
                .andExpect(status().isNotFound());
        assertThat(orders.count()).isZero();
    }

    @Test
    void passwordResetDoesNotClaimToSendEmailOrRevealAccounts() throws Exception {
        createUser("existing@example.com");
        String first = mvc.perform(post("/api/auth/password-reset-request").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", "existing@example.com"))))
                .andExpect(status().isNotImplemented()).andReturn().getResponse().getContentAsString();
        String second = mvc.perform(post("/api/auth/password-reset-request").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", "missing@example.com"))))
                .andExpect(status().isNotImplemented()).andReturn().getResponse().getContentAsString();
        assertThat(first).isEqualTo(second).contains("Ingen e-post er sendt");
    }

    @Test
    void longPasswordsAreValidationErrorsAndDeletedUserTokensAreUnauthorized() throws Exception {
        var registration = Map.of("firstName", "Demo", "lastName", "User", "email", "long@example.com",
                "password", "DemoPass1" + "a".repeat(72));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(registration)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.password").exists());
        User user = createUser("deleted@example.com");
        String token = login(user.getEmail());
        users.deleteById(user.getId());
        mvc.perform(get("/api/checkout/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void retryReturnsTheSameOrderAndOnlyDecrementsStockOnce() throws Exception {
        createUser("buyer@example.com");
        String token = login("buyer@example.com");
        String request = json.writeValueAsString(checkout(UUID.randomUUID()));
        String first = placeOrder(token, request);
        String second = placeOrder(token, request);
        assertThat(json.readTree(first).get("orderNumber")).isEqualTo(json.readTree(second).get("orderNumber"));
        assertThat(orders.count()).isEqualTo(1);
        assertThat(products.findById(product.getId()).orElseThrow().getStockQuantity()).isEqualTo(4);
    }

    @Test
    void simultaneousRetriesCreateOnlyOneOrder() throws Exception {
        User buyer = createUser("buyer@example.com");
        UUID requestId = UUID.randomUUID();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Callable<Long> request = () -> orderService.createOrder(buyer.getId(), requestId,
                    Map.of(product.getId(), 1), address()).getId();
            var results = executor.invokeAll(List.of(request, request));
            assertThat(results.get(0).get(10, TimeUnit.SECONDS)).isEqualTo(results.get(1).get(10, TimeUnit.SECONDS));
            assertThat(orders.count()).isEqualTo(1);
            assertThat(products.findById(product.getId()).orElseThrow().getStockQuantity()).isEqualTo(4);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void failedOrderRollsBackEarlierStockChanges() {
        User buyer = createUser("buyer@example.com");
        Product unavailable = products.saveAndFlush(new Product(null, "Unavailable", "", BigDecimal.ONE,
                "/images/belt.jpg", "Klær", 0));
        Map<Long, Integer> items = new LinkedHashMap<>();
        items.put(product.getId(), 2);
        items.put(unavailable.getId(), 1);
        assertThatThrownBy(() -> orderService.createOrder(buyer.getId(), UUID.randomUUID(), items, address()))
                .isInstanceOf(InsufficientStockException.class);
        assertThat(products.findById(product.getId()).orElseThrow().getStockQuantity()).isEqualTo(5);
        assertThat(orders.count()).isZero();
    }

    @Test
    void differentBuyersCannotBothBuyTheLastItem() throws Exception {
        product.setStockQuantity(1);
        products.saveAndFlush(product);
        User first = createUser("first@example.com");
        User second = createUser("second@example.com");
        CountDownLatch loaded = new CountDownLatch(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Callable<Boolean>> requests = List.of(stockRequest(first.getId(), loaded), stockRequest(second.getId(), loaded));
            var results = executor.invokeAll(requests, 20, TimeUnit.SECONDS);
            int successes = 0;
            for (var result : results) if (result.get()) successes++;
            assertThat(successes).isEqualTo(1);
            assertThat(orders.count()).isEqualTo(1);
            assertThat(products.findById(product.getId()).orElseThrow().getStockQuantity()).isZero();
        } finally {
            executor.shutdownNow();
        }
    }

    private Callable<Boolean> stockRequest(Long userId, CountDownLatch loaded) {
        return () -> {
            try {
                new TransactionTemplate(transactions).executeWithoutResult(status -> {
                    // Both transactions observe the same product version before either updates it.
                    products.findById(product.getId()).orElseThrow();
                    loaded.countDown();
                    try {
                        if (!loaded.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("Timed out");
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException(ex);
                    }
                    orderService.createOrder(userId, UUID.randomUUID(), Map.of(product.getId(), 1), address());
                });
                return true;
            } catch (ObjectOptimisticLockingFailureException ex) {
                return false;
            }
        };
    }

    @Test
    void requestIdCannotBeReusedForDifferentItems() {
        User buyer = createUser("buyer@example.com");
        UUID requestId = UUID.randomUUID();
        orderService.createOrder(buyer.getId(), requestId, Map.of(product.getId(), 1), address());
        assertThatThrownBy(() -> orderService.createOrder(buyer.getId(), requestId, Map.of(product.getId(), 2), address()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(orders.count()).isEqualTo(1);
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwords.encode("DemoPass1"));
        user.setFirstName("Demo");
        user.setLastName("User");
        user.setRoles(Set.of("USER"));
        return users.saveAndFlush(user);
    }

    private String login(String email) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "DemoPass1"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("token").asText();
    }

    private Map<String, Object> checkout(UUID requestId) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("requestId", requestId);
        request.put("street", "Testgate 1");
        request.put("city", "Oslo");
        request.put("zipCode", "0001");
        request.put("country", "Norge");
        request.put("items", Map.of(product.getId(), 1));
        return request;
    }

    private String placeOrder(String token, String body) throws Exception {
        return mvc.perform(post("/api/checkout").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

    private Address address() {
        Address address = new Address();
        address.setStreet("Testgate 1"); address.setCity("Oslo");
        address.setZipCode("0001"); address.setCountry("Norge");
        return address;
    }
}
