document.addEventListener("DOMContentLoaded", () => {

    let allProducts = [];

    // Fetch products from backend
    fetch("/api/products")
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            displayProducts(products);
            updateCartCount();
        })
        .catch(error => console.error("Error fetching products:", error));

    function displayProducts(products) {
        const productList = document.getElementById("product-list");
        productList.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.className = "product";
            productElement.dataset.id = product.id;
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:auto;">
                <p>${product.description}</p>
                <p><strong>kr ${product.price}</strong></p>
                <button onclick="addToCart(${product.id})">Legg i handlekurv</button>
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

    function updateCartCount() {
        fetch('/api/cart')
            .then(response => response.json())
            .then(cart => {
                const cartCount = document.getElementById("cart-count");
                const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
                cartCount.textContent = totalItems > 0 ? `(${totalItems})` : '';
            })
            .catch(() => {
                document.getElementById("cart-count").textContent = '';
            });
    }

    window.addToCart = (productId) => {
        fetch(`/api/cart/add?productId=${productId}&quantity=1`, { method: 'POST' })
            .then(response => response.json())
            .then(() => {
                updateCartCount();
                const notification = document.getElementById("cart-notification");
                notification.classList.add("show");
                setTimeout(() => {
                    notification.classList.remove("show");
                }, 3000);
            })
            .catch(() => {
                alert("Could not add product to cart.");
            });
    };

    window.toggleCategories = () => {
        const categoryList = document.getElementById('category-list');
        if (categoryList.style.display === 'none' || categoryList.style.display === '') {
            categoryList.style.display = 'flex';
        } else {
            categoryList.style.display = 'none';
        }
    };

    document.getElementById("view-cart").addEventListener("click", () => {
        window.location.href = "cart.html";
    });

    document.getElementById("search-box").addEventListener("input", () => {
        filterProducts();
    });
});