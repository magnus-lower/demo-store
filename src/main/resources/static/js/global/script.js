document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById('category-list');
    categoryList.style.display = 'none';

    let allProducts = [];


    const userIcon = document.getElementById('user-icon');
    const cartIcon = document.getElementById('cart-icon');
    const ordersModal = document.getElementById('orders-modal');
    const ordersDialog = Demo.dialog(ordersModal);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            const dropdown = document.getElementById('user-dropdown-content');
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                userIcon.setAttribute('aria-expanded', 'false');
                userIcon.focus();
            }
        }
    });
    updateUserInterface();

    function updateUserInterface() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userDropdownContent = document.getElementById('user-dropdown-content');

        if (token && user.firstName) {

            userIcon.classList.add('logged-in');

        } else {

            userIcon.classList.remove('logged-in');
            userIcon.setAttribute('aria-expanded', 'false');

            userDropdownContent.classList.remove('show');
        }
    }


    if (userIcon) {
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');

            if (token) {

                e.stopPropagation();
                const dropdownContent = document.getElementById('user-dropdown-content');
                const isVisible = dropdownContent.classList.contains('show');
                dropdownContent.classList.toggle('show', !isVisible);
                userIcon.setAttribute('aria-expanded', String(!isVisible));
            } else {

                window.location.href = '/html/auth/auth.html';
            }
        });
    }


    document.addEventListener('click', (e) => {
        const dropdownContent = document.getElementById('user-dropdown-content');
        const userDropdown = e.target.closest('.user-dropdown');
        const userWrapper = e.target.closest('.user-wrapper');


        if (dropdownContent && !userDropdown && !userWrapper) {
            dropdownContent.classList.remove('show');
            userIcon.setAttribute('aria-expanded', 'false');
        }
    });


    const viewOrdersBtn = document.getElementById('view-orders');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const dropdownContent = document.getElementById('user-dropdown-content');
            dropdownContent.classList.remove('show');
            showOrdersModal();
        });
    }


    const viewProfileBtn = document.getElementById('view-profile');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Profilside kommer snart!');
        });
    }


    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const dropdownContent = document.getElementById('user-dropdown-content');
            dropdownContent.classList.remove('show');
            logout();
        });
    }


    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/html/cart/cart.html';
        });
    }


    Demo.request('/api/products')
        .then(products => {
            allProducts = products;
            displayProducts(products);
            updateCartCount();
        })
        .catch(error => {
            document.getElementById('product-list').textContent = error.message;
        });

    function displayProducts(products) {
        const productList = document.getElementById("product-list");
        if (!productList) {
            console.error("Element with id 'product-list' not found!");
            return;
        }


        productList.classList.add('filtering');


        const existingProducts = productList.querySelectorAll('.product');
        existingProducts.forEach(product => {
            product.classList.add('fade-out');
        });


        setTimeout(() => {
            productList.replaceChildren();
            products.forEach((product, index) => {
                const productElement = document.createElement("div");
                productElement.className = "product fade-in";
                productElement.dataset.id = product.id;
                productElement.style.animationDelay = `${index * 0.1}s`;
                const price = Demo.element('p');
                price.append(Demo.element('strong', '', 'kr ' + Number(product.price).toFixed(2)));
                const button = Demo.element('button', '', 'Legg i handlekurv');
                button.addEventListener('click', async () => {
                    button.disabled = true;
                    try { await window.addToCart(product.id); } finally { button.disabled = false; }
                });
                productElement.append(
                    Demo.element('h3', '', product.name),
                    Demo.image(product.imageUrl, product.name),
                    Demo.element('p', '', product.description), price, button);
                productList.appendChild(productElement);
            });


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


        if (categoryList.classList.contains('show')) {
            const button = document.querySelector('.dropdown-button');
            button.setAttribute('aria-expanded', 'false');
            button.classList.remove('active');
            if (categoryList.contains(document.activeElement)) button.focus();
            categoryList.classList.remove('show');
            setTimeout(() => {
                if (!categoryList.classList.contains('show')) {
                    categoryList.style.display = 'none';
                }
            }, 400);
        }
    };

    function updateCartCount() {
        Demo.request('/api/cart')
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
        return Demo.request(`/api/cart/add?productId=${productId}&quantity=1`, {method: 'POST'})
            .then(() => {
                updateCartCount();
                const notification = document.getElementById('cart-notification');
                notification.classList.add('show');
                setTimeout(() => notification.classList.remove('show'), 3000);
            })
            .catch(error => alert(error.message));
    };

    window.toggleCategories = () => {
        const dropdownButton = document.querySelector('.dropdown-button');
        const isShowing = categoryList.classList.contains('show');
        dropdownButton.setAttribute('aria-expanded', String(!isShowing));

        if (isShowing) {

            categoryList.classList.remove('show');
            dropdownButton.classList.remove('active');


            setTimeout(() => {
                if (!categoryList.classList.contains('show')) {
                    categoryList.style.display = 'none';
                }
            }, 400);
        } else {

            categoryList.style.display = 'flex';
            dropdownButton.classList.add('active');


            setTimeout(() => {
                categoryList.classList.add('show');
            }, 10);
        }
    };


    document.addEventListener('click', (e) => {
        const dropdownButton = document.querySelector('.dropdown-button');
        const categoryListElement = document.getElementById('category-list');


        if (window.innerWidth <= 768 && categoryListElement.style.display === 'flex') {

            if (!dropdownButton.contains(e.target) && !categoryListElement.contains(e.target)) {
                categoryListElement.style.display = 'none';
            }
        }
    });


    const searchBox = document.getElementById("search-box");
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            filterProducts();
        });
    }


    function showOrdersModal() {
        if (!localStorage.getItem('token')) {
            alert('Du må være logget inn for å se bestillinger');
            return;
        }

        userIcon.setAttribute('aria-expanded', 'false');
        ordersDialog.open(userIcon);
        loadUserOrders();
    }


    function loadUserOrders() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<p>Laster bestillinger...</p>';

        Demo.request('/api/checkout/orders', {
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
        })
            .then(displayOrders)
            .catch(error => {
                ordersList.textContent = error.message;
                updateUserInterface();
            });
    }

    function displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>Du har ingen bestillinger enda.</p>';
            return;
        }

        const container = Demo.element('div', 'orders-container');
        for (const order of orders) {
            const row = Demo.element('div', 'order-item');
            const header = Demo.element('div', 'order-header');
            header.append(Demo.element('h4', '', 'Demobestilling #' + order.orderNumber),
                Demo.element('span', 'order-date', new Date(order.orderDate).toLocaleDateString('no-NO')));
            const details = Demo.element('div', 'order-details');
            details.append(Demo.element('p', '', 'Status: ' + getStatusText(order.status)),
                Demo.element('p', '', 'Totalt: kr ' + Number(order.totalAmount).toFixed(2)));
            row.append(header, details);
            container.append(row);
        }
        ordersList.replaceChildren(container);
    }

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


    function logout() {

        const dropdownContent = document.getElementById('user-dropdown-content');
        if (dropdownContent) {
            dropdownContent.classList.remove('show');
        }


        const userIcon = document.querySelector('.user-icon');
        if (userIcon) {
            userIcon.classList.add('logging-out');
        }


        showLogoutNotification();


        setTimeout(() => {

            localStorage.removeItem('token');
            localStorage.removeItem('user');


            updateUserInterface();


            Demo.request('/api/cart/clear', {method: 'POST'}).then(updateCartCount).catch(error => alert(error.message));


            if (userIcon) {
                userIcon.classList.remove('logging-out');
            }
        }, 600);
    }


    function showLogoutNotification() {

        const existingNotification = document.querySelector('.logout-notification');
        if (existingNotification) {
            existingNotification.remove();
        }


        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            <span>Du er nå logget ut</span>
        `;

        document.body.appendChild(notification);


        setTimeout(() => {
            notification.classList.add('show');
        }, 100);


        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 2500);
    }


    console.log("Script loaded successfully");
});