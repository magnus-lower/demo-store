document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById('category-list');
    categoryList.style.display = 'none';

    let allProducts = [];

    // DOM elementer
    const userIcon = document.getElementById('user-icon');
    const cartIcon = document.getElementById('cart-icon');
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
        const userDropdownContent = document.getElementById('user-dropdown-content');

        if (token && user.firstName) {
            // Bruker er logget inn
            userIcon.classList.add('logged-in');
            // Ikke sett display direkte - la CSS og show klassen håndtere det
        } else {
            // Bruker er ikke logget inn
            userIcon.classList.remove('logged-in');
            // Sørg for at dropdown er skjult når ikke logget inn
            userDropdownContent.classList.remove('show');
        }
    }

    // Event handlers for brukerikonet
    if (userIcon) {
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            
            if (token) {
                // Bruker er logget inn - toggle dropdown
                e.stopPropagation();
                const dropdownContent = document.getElementById('user-dropdown-content');
                const isVisible = dropdownContent.classList.contains('show');
                dropdownContent.classList.toggle('show', !isVisible);
            } else {
                // Bruker er ikke logget inn - gå til innloggingsside
                window.location.href = 'auth.html';
            }
        });
    }

    // Lukk dropdown når man klikker utenfor
    document.addEventListener('click', (e) => {
        const dropdownContent = document.getElementById('user-dropdown-content');
        const userDropdown = e.target.closest('.user-dropdown');
        const userWrapper = e.target.closest('.user-wrapper');
        
        // Lukk dropdown hvis klikket ikke var innenfor user-dropdown området
        if (dropdownContent && !userDropdown && !userWrapper) {
            dropdownContent.classList.remove('show');
        }
    });

    // Mine bestillinger klikk-handler
    const viewOrdersBtn = document.getElementById('view-orders');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Lukk dropdown først
            const dropdownContent = document.getElementById('user-dropdown-content');
            dropdownContent.classList.remove('show');
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
            // Lukk dropdown først
            const dropdownContent = document.getElementById('user-dropdown-content');
            dropdownContent.classList.remove('show');
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
    console.log("Fetching products from /api/products...");
    fetch("/api/products")
        .then(response => {
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            console.log("Products received:", products);
            console.log("Number of products:", products.length);
            allProducts = products;
            displayProducts(products);
            updateCartCount();
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            console.error("Error details:", error.message);
        });

    function displayProducts(products) {
        console.log("displayProducts called with:", products);
        const productList = document.getElementById("product-list");
        console.log("Product list element:", productList);
        
        if (!productList) {
            console.error("Element with id 'product-list' not found!");
            return;
        }
        
        // Smooth transition for filtering
        productList.classList.add('filtering');
        
        // Fade out existing products
        const existingProducts = productList.querySelectorAll('.product');
        existingProducts.forEach(product => {
            product.classList.add('fade-out');
        });
        
        // Wait for fade out animation before showing new products
        setTimeout(() => {
            productList.innerHTML = '';
            products.forEach((product, index) => {
                const productElement = document.createElement("div");
                productElement.className = "product fade-in";
                productElement.dataset.id = product.id;
                productElement.style.animationDelay = `${index * 0.1}s`;
                productElement.innerHTML = `
                    <h3>${product.name}</h3>
                    <img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:auto;">
                    <p>${product.description}</p>
                    <p><strong>kr ${product.price}</strong></p>
                    <button onclick="addToCart(${product.id})">Legg i handlekurv</button>
                `;
                productList.appendChild(productElement);
            });
            
            // Remove filtering class and fade-in class after animation
            productList.classList.remove('filtering');
            setTimeout(() => {
                products.forEach((_, index) => {
                    const productElement = productList.children[index];
                    if (productElement) {
                        productElement.classList.remove('fade-in');
                    }
                });
            }, 500 + (products.length * 100));
        }, existingProducts.length > 0 ? 300 : 0);
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

        // Skjul kategorilisten etter at man har valgt en kategori med smooth transition
        if (categoryList.classList.contains('show')) {
            categoryList.classList.remove('show');
            setTimeout(() => {
                if (!categoryList.classList.contains('show')) {
                    categoryList.style.display = 'none';
                }
            }, 400);
        }
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

    // Forbedret toggleCategories funksjon med smooth animasjoner
    window.toggleCategories = () => {
        const dropdownButton = document.querySelector('.dropdown-button');
        const isShowing = categoryList.classList.contains('show');
        
        if (isShowing) {
            // Skjul kategorilisten med animasjon
            categoryList.classList.remove('show');
            dropdownButton.classList.remove('active');
            
            // Vent til animasjonen er ferdig før vi setter display: none
            setTimeout(() => {
                if (!categoryList.classList.contains('show')) {
                    categoryList.style.display = 'none';
                }
            }, 400);
        } else {
            // Vis kategorilisten med animasjon
            categoryList.style.display = 'flex';
            dropdownButton.classList.add('active');
            
            // Trigger animasjonen med et lite delay
            setTimeout(() => {
                categoryList.classList.add('show');
            }, 10);
        }
    };

    // Lukk kategorilisten når man klikker utenfor (kun på mobil)
    document.addEventListener('click', (e) => {
        const dropdownButton = document.querySelector('.dropdown-button');
        const categoryListElement = document.getElementById('category-list');

        // Sjekk om vi er på mobil og om kategorilisten er synlig
        if (window.innerWidth <= 768 && categoryListElement.style.display === 'flex') {
            // Hvis klikket ikke var på dropdown-knappen eller inne i kategorilisten
            if (!dropdownButton.contains(e.target) && !categoryListElement.contains(e.target)) {
                categoryListElement.style.display = 'none';
            }
        }
    });

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
        // Lukk dropdown først med smooth animasjon
        const dropdownContent = document.getElementById('user-dropdown-content');
        if (dropdownContent) {
            dropdownContent.classList.remove('show');
        }

        // Legg til logout animasjon på bruker-ikon
        const userIcon = document.querySelector('.user-icon');
        if (userIcon) {
            userIcon.classList.add('logging-out');
        }

        // Vis logout-notifikasjon
        showLogoutNotification();

        // Vent litt før vi gjør faktiske endringer for smooth animasjon
        setTimeout(() => {
            // Fjern token og brukerdata fra localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Oppdater brukergrensesnitt
            updateUserInterface();

            // Tøm handlekurv
            fetch('/api/cart/clear', { method: 'POST' }).catch(() => {});

            // Oppdater handlekurv-teller
            updateCartCount();

            // Fjern logout-animasjon
            if (userIcon) {
                userIcon.classList.remove('logging-out');
            }
        }, 600); // Matcher animasjonens varighet
    }

    // Funksjon for å vise logout-notifikasjon
    function showLogoutNotification() {
        // Fjern eksisterende notifikasjon hvis den finnes
        const existingNotification = document.querySelector('.logout-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Lag ny logout-notifikasjon
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            <span>Du er nå logget ut</span>
        `;

        document.body.appendChild(notification);

        // Vis notifikasjonen
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Skjul og fjern notifikasjonen etter 2.5 sekunder
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 2500);
    }

    // Debug logg
    console.log("Script loaded successfully");
});