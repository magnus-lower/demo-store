function toggleCategories() {
    const categoryList = document.getElementById('category-list');
    if (categoryList.style.display === 'none' || categoryList.style.display === '') {
        categoryList.style.display = 'flex';
    } else {
        categoryList.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let allProducts = [];

    fetch("/api/products")
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            displayProducts(products);
        })
        .catch(error => console.error("Feil ved henting av produkter:", error));

    function displayProducts(products) {
        const productList = document.getElementById("product-list");
        productList.innerHTML = ''; // Fjern tidligere produkter

        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.className = "product";
            productElement.dataset.id = product.id;
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:auto;">
                <p>${product.description}</p>
                <p><strong>kr ${product.price}</strong></p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.imageUrl}')">Legg i handlekurv</button>
            `;
            productList.appendChild(productElement);
        });
    }

    window.filterProducts = (category = 'Alle') => {
        let filteredProducts = allProducts;

        const searchTerm = document.getElementById("search-box").value.toLowerCase();

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        if (category !== 'Alle') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        displayProducts(filteredProducts);
    };

    window.addToCart = (id, name, price, imageUrl) => {
        const item = cart.find(product => product.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({ id, name, price, imageUrl, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));

        const notification = document.getElementById("cart-notification");
        notification.classList.add("show");

        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    };

    document.getElementById("view-cart").addEventListener("click", () => {
        window.location.href = "cart.html";
    });

    document.getElementById("search-box").addEventListener("input", () => {
        filterProducts();
    });
});