# E-Commerce Platform

A full-stack online store demo built with Spring Boot and JavaScript. Users can browse products, manage a shopping cart, and simulate purchases.

**Live demo:** [E-Commerce Platform](https://demo-store-k4g7.onrender.com/)

## Features

- Browse and search products
- Register and log in
- Add and remove items from the shopping cart
- Simulate checkout and view orders
- Responsive design for desktop and mobile

## Technologies

Java, Spring Boot, Spring Security, Spring Data JPA, H2, JavaScript, HTML, CSS, Maven, Docker

## Run locally

Requires Java 17+ and Maven.

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Open http://localhost:8080.

The development profile generates a temporary JWT signing key automatically.

## Tests

```bash
mvn test
node --test
```

## About the demo

This is a portfolio project, not a real online store. No payments are processed or products shipped.

The application uses an in-memory database, so accounts and orders are reset when the server restarts. Use test credentials rather than personal passwords.

The application is hosted on Render. Production requires a secure `JWT_SECRET` and `SERVER_SERVLET_SESSION_COOKIE_SECURE=true`.
