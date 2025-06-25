document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById('category-list');
    categoryList.style.display = 'none';

    let allProducts = [];

    // DOM elementer
    const userIcon = document.getElementById('user-icon');
    const cartIcon = document.getElementById('cart-icon');
    const userDropdownBtn = document.getElementById('user-dropdown-btn');
    const ordersModal = document.getElementById('orders-modal');
    const closeOrdersModal = document.getElementById('close-orders-modal');

    // Hent login-status fra localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Oppdater brukergrensesnitt basert på login-status
    updateUserInterface();

    function updateUserInterface() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const notLoggedIn = document.getElementById('not-logged-in');
        const loggedIn = document.getElementById('logged-in');
        const userGreeting = document.getElementById('user-greeting');

        if (token && user.firstName) {
            // Bruker er logget inn
            notLoggedIn.style.display = 'none';
            loggedIn.style.display = 'block';
            userGreeting.textContent = `Hei, ${user.firstName}`;
        } else {
            // Bruker er ikke logget inn
            notLoggedIn.style.display = 'block';
            loggedIn.style.display = 'none';
        }
    }

    // Event handlers for brukerikonet
    if (userIcon) {
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            // Gå til innloggingsside
            window.location.href = 'auth.html';
        });
    }

    // Event handler for user dropdown
    if (userDropdownBtn) {
        userDropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropdownContent = document.getElementById('user-dropdown-content');
            dropdownContent.classList.toggle('show');
        });
    }

    // Lukk dropdown når man klikker utenfor
    document.addEventListener('click', (e) => {
        const dropdownContent = document.getElementById('user-dropdown-content');
        if (dropdownContent && !e.target.closest('.user-dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });

    // Mine bestillinger klikk-handler
    const viewOrdersBtn = document.getElementById('view-orders');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showOrdersModal();
        });
    }

    // Min profil klikk-handler
    const viewProfileBtn = document.getElementById('view-profile');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Profilside kommer snart!');
        });
    }

    // Logg ut klikk-handler
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Modal event handlers
    if (closeOrdersModal) {
        closeOrdersModal.addEventListener('click', () => {
            ordersModal.style.display = 'none';
        });
    }

    // Lukk modal når man klikker utenfor
    window.addEventListener('click', (e) => {
        if (e.target === ordersModal) {
            ordersModal.style.display = 'none';
        }
    });

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
                cartCount.textContent = totalItems > 0 ? `${totalItems}` : '';
                cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
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

    // Funksjon for å vise bestillinger modal
    function showOrdersModal() {
        if (!token) {
            alert('Du må være logget inn for å se bestillinger');
            return;
        }

        ordersModal.style.display = 'block';
        loadUserOrders();
    }

    // Funksjon for å laste brukerens bestillinger
    function loadUserOrders() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<p>Laster bestillinger...</p>';

        fetch('/api/checkout/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Kunne ikke hente bestillinger');
                }
                return response.json();
            })
            .then(orders => {
                displayOrders(orders);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                ordersList.innerHTML = '<p>Kunne ikke laste bestillinger. Prøv igjen senere.</p>';
            });
    }

    // Funksjon for å vise bestillinger
    function displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>Du har ingen bestillinger enda.</p>';
            return;
        }

        let ordersHtml = '<div class="orders-container">';
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate).toLocaleDateString('no-NO');
            ordersHtml += `
                <div class="order-item">
                    <div class="order-header">
                        <h4>Bestilling #${order.orderNumber}</h4>
                        <span class="order-date">${orderDate}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Status:</strong> ${getStatusText(order.status)}</p>
                        <p><strong>Total:</strong> kr ${order.totalAmount}</p>
                    </div>
                </div>
            `;
        });
        ordersHtml += '</div>';

        ordersList.innerHTML = ordersHtml;
    }

    // Hjelpefunksjon for å oversette status
    function getStatusText(status) {
        const statusMap = {
            'PENDING': 'Venter',
            'PAID': 'Betalt',
            'SHIPPED': 'Sendt',
            'DELIVERED': 'Levert',
            'CANCELLED': 'Kansellert'
        };
        return statusMap[status] || status;
    }

    // Logg ut funksjon
    function logout() {
        // Lukk dropdown først
        const dropdownContent = document.getElementById('user-dropdown-content');
        if (dropdownContent) {
            dropdownContent.classList.remove('show');
        }

        // Fjern token og brukerdata fra localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Oppdater brukergrensesnitt
        updateUserInterface();

        // Tøm handlekurv
        fetch('/api/cart/clear', { method: 'POST' }).catch(() => {});

        // Oppdater handlekurv-teller
        updateCartCount();

        // Ingen melding - bare stille utlogging
    }

    // Debug logg
    console.log("Script loaded successfully");
});