package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @PostConstruct
    public void initializeProducts() {
        // Sjekk om produkter allerede finnes
        if (productRepository.count() == 0) {
            log.info("Initializing products in database...");

            // EKSISTERENDE PRODUKTER
            Product flaske = new Product();
            flaske.setName("Flaske");
            flaske.setDescription("En drikkeflaske som kan brukes til alle formål");
            flaske.setPrice(new BigDecimal("10.99"));
            flaske.setImageUrl("/images/drinking bottle.jpg");
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

            // NYE PRODUKTER - MAT OG DRIKKE (4 produkter)
            Product kaffekopp = new Product();
            kaffekopp.setName("Kaffekopp");
            kaffekopp.setDescription("Elegant kaffekopp i glass");
            kaffekopp.setPrice(new BigDecimal("8.99"));
            kaffekopp.setImageUrl("/images/Coffee_cup.jpg");
            kaffekopp.setCategory("Mat og drikke");
            kaffekopp.setStockQuantity(25);

            Product lunchboks = new Product();
            lunchboks.setName("Lunchboks");
            lunchboks.setDescription("Praktisk lunchboks med god lagring for en sunn lunsj");
            lunchboks.setPrice(new BigDecimal("14.99"));
            lunchboks.setImageUrl("/images/lunchbox.jpg");
            lunchboks.setCategory("Mat og drikke");
            lunchboks.setStockQuantity(18);

            Product vinåpner = new Product();
            vinåpner.setName("Vinåpner");
            vinåpner.setDescription("Klassisk vinåpner av høy kvalitet");
            vinåpner.setPrice(new BigDecimal("19.99"));
            vinåpner.setImageUrl("/images/wine opener.jpg");
            vinåpner.setCategory("Mat og drikke");
            vinåpner.setStockQuantity(12);

            Product termokanne = new Product();
            termokanne.setName("Termokanne");
            termokanne.setDescription("Isolert termokanne som holder drikken varm i timevis");
            termokanne.setPrice(new BigDecimal("24.99"));
            termokanne.setImageUrl("/images/Bottle.jpg");
            termokanne.setCategory("Mat og drikke");
            termokanne.setStockQuantity(20);

            // NYE PRODUKTER - KLÆR (4 produkter)
            Product caps = new Product();
            caps.setName("Caps");
            caps.setDescription("Praktisk caps som beskytter mot sol");
            caps.setPrice(new BigDecimal("16.99"));
            caps.setImageUrl("/images/caps.jpg");
            caps.setCategory("Klær");
            caps.setStockQuantity(30);

            Product hansker = new Product();
            hansker.setName("Hansker");
            hansker.setDescription("Varme og komfortable hansker");
            hansker.setPrice(new BigDecimal("22.99"));
            hansker.setImageUrl("/images/gloves.jpg");
            hansker.setCategory("Klær");
            hansker.setStockQuantity(14);

            Product skjerf = new Product();
            skjerf.setName("Skjerf");
            skjerf.setDescription("Mykt og stilig skjerf som passer til enhver anledning");
            skjerf.setPrice(new BigDecimal("18.99"));
            skjerf.setImageUrl("/images/scarf.jpg");
            skjerf.setCategory("Klær");
            skjerf.setStockQuantity(22);

            Product belte = new Product();
            belte.setName("Belte");
            belte.setDescription("Elegant lærbelte som passer til både formelle og uformelle antrekk");
            belte.setPrice(new BigDecimal("29.99"));
            belte.setImageUrl("/images/belt.jpg");
            belte.setCategory("Klær");
            belte.setStockQuantity(16);

            // NYE PRODUKTER - MØBLER (4 produkter)
            Product pute = new Product();
            pute.setName("Pute");
            pute.setDescription("Myk og komfortabel pute som gir ekstra komfort");
            pute.setPrice(new BigDecimal("13.99"));
            pute.setImageUrl("/images/pillow.jpg");
            pute.setCategory("Møbler");
            pute.setStockQuantity(35);

            Product bordlampe = new Product();
            bordlampe.setName("Bordlampe");
            bordlampe.setDescription("Moderne bordlampe som gir behagelig lys til ethvert rom");
            bordlampe.setPrice(new BigDecimal("34.99"));
            bordlampe.setImageUrl("/images/table lamp.jpg");
            bordlampe.setCategory("Møbler");
            bordlampe.setStockQuantity(11);

            Product bokhylle = new Product();
            bokhylle.setName("Bokhylle");
            bokhylle.setDescription("Kompakt bokhylle perfekt for å organisere bøker");
            bokhylle.setPrice(new BigDecimal("49.99"));
            bokhylle.setImageUrl("/images/bookshelf.jpg");
            bokhylle.setCategory("Møbler");
            bokhylle.setStockQuantity(8);

            Product skrivebordsstol = new Product();
            skrivebordsstol.setName("Skrivebordsstol");
            skrivebordsstol.setDescription("Ergonomisk skrivebordsstol som gir god støtte under lange arbeidsøkter");
            skrivebordsstol.setPrice(new BigDecimal("79.99"));
            skrivebordsstol.setImageUrl("/images/desk chair.jpg");
            skrivebordsstol.setCategory("Møbler");
            skrivebordsstol.setStockQuantity(6);

            // Lagre alle eksisterende produkter
            productRepository.save(flaske);
            productRepository.save(solbriller);
            productRepository.save(potteplante);

            // Lagre alle nye Mat og drikke produkter
            productRepository.save(kaffekopp);
            productRepository.save(lunchboks);
            productRepository.save(vinåpner);
            productRepository.save(termokanne);

            // Lagre alle nye Klær produkter
            productRepository.save(caps);
            productRepository.save(hansker);
            productRepository.save(skjerf);
            productRepository.save(belte);

            // Lagre alle nye Møbler produkter
            productRepository.save(pute);
            productRepository.save(bordlampe);
            productRepository.save(bokhylle);
            productRepository.save(skrivebordsstol);

            log.info("Successfully initialized {} products in database", productRepository.count());
        } else {
            log.debug("Products already exist in database. Total count: {}", productRepository.count());
        }
    }

    public List<Product> getProducts() {
        List<Product> products = productRepository.findAll();
        log.debug("Found {} products in database", products.size());
        return products;
    }
}