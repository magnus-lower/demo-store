package com.example.ecommerce.service;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @PostConstruct
    public void initializeProducts() {
        // Sjekk om produkter allerede finnes
        if (productRepository.count() == 0) {
            System.out.println("Initializing products in database...");

            // Opprett produkter
            Product flaske = new Product();
            flaske.setName("Flaske");
            flaske.setDescription("En drikkeflaske som kan brukes til alle formål");
            flaske.setPrice(new BigDecimal("10.99"));
            flaske.setImageUrl("/images/Bottle.jpg");
            flaske.setCategory("Mat og drikke");
            flaske.setStockQuantity(10);

            Product solbriller = new Product();
            solbriller.setName("Solbriller");
            solbriller.setDescription("Solbriller som passer perfekt til alle");
            solbriller.setPrice(new BigDecimal("12.99"));
            solbriller.setImageUrl("/images/Sunglasses.jpg");
            solbriller.setCategory("Klær");
            solbriller.setStockQuantity(15);

            Product potteplante = new Product();
            potteplante.setName("Potteplante");
            potteplante.setDescription("En potteplante som passer til alle typer planter");
            potteplante.setPrice(new BigDecimal("15.99"));
            potteplante.setImageUrl("/images/Plant pot.jpg");
            potteplante.setCategory("Møbler");
            potteplante.setStockQuantity(8);

            // Lagre i databasen
            productRepository.save(flaske);
            productRepository.save(solbriller);
            productRepository.save(potteplante);

            System.out.println("Products initialized in database");
        } else {
            System.out.println("Products already exist in database");
        }
    }

    public List<Product> getProducts() {
        List<Product> products = productRepository.findAll();
        System.out.println("Found " + products.size() + " products in database");
        return products;
    }
}