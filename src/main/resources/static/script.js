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
        const existingProducts = productList.children;

        // Remove only the elements that need to be removed, instead of resetting the entire innerHTML
        Array.from(existingProducts).forEach(productElement => {
            const productId = productElement.dataset.id;
            const productExists = products.some(product => product.id == productId);

            if (!productExists) {
                productElement.remove();
            }
        });

        // Add only the new products
        products.forEach(product => {
            if (!document.querySelector(`[data-id='${product.id}']`)) {
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
            }
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.filterProducts = debounce((category = null) => {
        let filteredProducts = allProducts;

        const searchTerm = document.getElementById("search-box").value.toLowerCase();

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        if (category && category !== 'Alle') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        displayProducts(filteredProducts);
    }, 300);

    window.addToCart = (id, name, price, imageUrl) => {
        const item = cart.find(product => product.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({ id, name, price, imageUrl, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    document.getElementById("view-cart").addEventListener("click", () => {
        window.location.href = "cart.html";
    });

    document.getElementById("search-box").addEventListener("input", () => {
        filterProducts();
    });
});
