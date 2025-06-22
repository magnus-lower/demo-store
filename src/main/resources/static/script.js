document.addEventListener("DOMContentLoaded", () => {

    const categoryList = document.getElementById('category-list');
    categoryList.style.display = 'none';

    let allProducts = [];

    // Fix for user icon click handling
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        console.log('User icon found, adding click handler');
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('User icon clicked');
            window.location.href = 'auth.html';
        });

        // Also handle via href as backup
        userIcon.href = 'auth.html';
    } else {
        console.log('User icon not found');
    }

    // Fix for cart icon click handling
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        console.log('Cart icon found, adding click handler');
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked');
            window.location.href = 'cart.html';
        });

        // Also handle via href as backup
        cartIcon.href = 'cart.html';
    } else {
        console.log('Cart icon not found');
    }

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
        if (categoryList.style.display === 'none') {
            categoryList.style.display = 'flex';
        } else {
            categoryList.style.display = 'none';
        }
    };

    // Check if view-cart button exists before adding event listener
    const viewCartButton = document.getElementById("view-cart");
    if (viewCartButton) {
        viewCartButton.addEventListener("click", () => {
            window.location.href = "cart.html";
        });
    }

    // Add search functionality
    const searchBox = document.getElementById("search-box");
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            filterProducts();
        });
    }

    // Debug: Check if elements exist
    console.log('Script loaded. Elements found:', {
        userIcon: !!document.querySelector('.user-icon'),
        cartIcon: !!document.querySelector('.cart-icon'),
        searchBox: !!document.getElementById("search-box"),
        viewCart: !!document.getElementById("view-cart")
    });
});