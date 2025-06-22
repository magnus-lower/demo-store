document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById('category-list');
    categoryList.style.display = 'none';

    let allProducts = [];

    const userIcon = document.getElementById('user-icon');
    const cartIcon = document.getElementById('cart-icon');
    const userProfile = document.getElementById('user-profile');

    // Hent login-status fra localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Vis korrekt brukergrensesnitt basert på login-status
    if (token && user.firstName) {
        document.getElementById('logged-in').style.display = 'block';
        document.getElementById('not-logged-in').style.display = 'none';
        document.getElementById('user-greeting').textContent = `Hei, ${user.firstName}`;
    } else {
        document.getElementById('not-logged-in').style.display = 'block';
        document.getElementById('logged-in').style.display = 'none';
    }

    // Brukerikon logikk
    if (userIcon) {
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (token && user.firstName) {
                // Logget inn -> toggle dropdown
                userProfile.classList.toggle('active');
            } else {
                // Ikke logget inn -> gå til auth.html
                window.location.href = 'auth.html';
            }
        });
    }

    // Handle cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }

    // Hent produkter fra backend
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
        if (categoryList.style.display === 'none') {
            categoryList.style.display = 'flex';
        } else {
            categoryList.style.display = 'none';
        }
    };

    // Søke-input
    const searchBox = document.getElementById("search-box");
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            filterProducts();
        });
    }

    // Debug logg
    console.log("Script loaded successfully");
});