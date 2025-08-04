document.addEventListener("DOMContentLoaded", () => {
    let cart = [];

    // Fetch cart from backend
    function loadCart() {
        fetch('/api/cart')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to load cart');
                }
                return res.json();
            })
            .then(data => {
                console.log("Cart data loaded:", data);
                cart = data || [];
                updateCartUI();
            })
            .catch(err => {
                console.error("Error loading cart:", err);
                updateCartUI(); // Still update UI even if there's an error
            });
    }

    // Update cart UI
    function updateCartUI() {
        const cartItems = document.getElementById("cart-items");
        const emptyCartMessage = document.getElementById("empty-cart-message");
        const backToStoreButton = document.getElementById("back-to-store");
        const clearCartButton = document.getElementById("clear-cart");
        const cartTotalElement = document.getElementById("cart-total");
        const orderSummary = document.getElementById("order-summary");
        const checkoutButton = document.getElementById("checkout-button");

        cartItems.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItems.style.display = 'none';
            backToStoreButton.style.display = 'none';
            clearCartButton.style.display = 'none';
            cartTotalElement.style.display = 'none';
            orderSummary.style.display = 'none';
            checkoutButton.style.display = 'none';
            return;
        }

        emptyCartMessage.style.display = 'none';
        cartItems.style.display = 'block';
        backToStoreButton.style.display = 'block';
        clearCartButton.style.display = 'block';
        cartTotalElement.style.display = 'block';
        orderSummary.style.display = 'block';
        checkoutButton.style.display = 'block';

        let itemsCount = 0;
        let itemsTotal = 0;

        cart.forEach((item, index) => {
            itemsCount += item.quantity;
            // If price is an object (BigDecimal), use item.price.value or item.price, else just item.price
            let price = typeof item.price === "object" && item.price !== null
                ? (item.price.value || item.price)
                : item.price;
            itemsTotal += price * item.quantity;

            const cartItem = document.createElement("li");
            cartItem.dataset.id = item.id;
            cartItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" style="width:50px; height:auto;">
                ${item.name} - kr ${price}
                <button class="decrease" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase" data-index="${index}">+</button>
                <button class="remove-item" data-index="${index}">×</button>
            `;
            cartItems.appendChild(cartItem);
        });

        // Update order summary
        document.getElementById("items-count").textContent = itemsCount;
        document.getElementById("items-total").textContent = `kr ${itemsTotal.toFixed(2)}`;
        document.getElementById("final-total").textContent = `kr ${(itemsTotal + 49).toFixed(2)}`;
        updateCartTotal();
    }

    // Update total price
    function updateCartTotal() {
        const cartTotalElement = document.getElementById("cart-total");
        const total = cart.reduce((sum, item) => {
            let price = typeof item.price === "object" && item.price !== null
                ? (item.price.value || item.price)
                : item.price;
            return sum + price * item.quantity;
        }, 0);
        cartTotalElement.textContent = `Totalt: kr ${total.toFixed(2)}`;
    }

    // Handle cart item button clicks
    document.getElementById("cart-items").addEventListener("click", (event) => {
        const target = event.target;
        const index = target.dataset.index;
        if (index === undefined) return;
        const item = cart[index];

        if (target.classList.contains("increase")) {
            fetch(`/api/cart/add?productId=${item.id}&quantity=1`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(() => loadCart())
                .catch(error => {
                    console.error('Error increasing quantity:', error);
                });
        }
        if (target.classList.contains("decrease")) {
            if (item.quantity > 1) {
                fetch(`/api/cart/add?productId=${item.id}&quantity=-1`, { method: 'POST' })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(() => loadCart())
                    .catch(error => {
                        console.error('Error decreasing quantity:', error);
                    });
            } else {
                fetch(`/api/cart/remove?productId=${item.id}`, { method: 'POST' })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(() => loadCart())
                    .catch(error => {
                        console.error('Error removing item:', error);
                    });
            }
        }
        if (target.classList.contains("remove-item")) {
            fetch(`/api/cart/remove?productId=${item.id}`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(() => loadCart())
                .catch(error => {
                    console.error('Error removing item:', error);
                });
        }
    });

    // "Back to store" buttons
    document.getElementById("back-to-store").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    document.getElementById("back-to-store-empty").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // "Clear cart" button
    document.getElementById("clear-cart").addEventListener("click", () => {
        fetch('/api/cart/clear', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => loadCart())
            .catch(error => {
                console.error('Error clearing cart:', error);
            });
    });

    // Updated checkout button functionality
    document.getElementById("checkout-button").addEventListener("click", () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            showLoginModal();
            return;
        }

        // Check if cart has items
        if (cart.length === 0) {
            alert('Handlekurven er tom');
            return;
        }

        // Prepare checkout data
        const items = {};
        cart.forEach(item => {
            items[item.id] = item.quantity;
        });

        const checkoutData = {
            street: "Testgate 1", // Default address - in real app this would come from a form
            city: "Oslo",
            zipCode: "0001",
            country: "Norge",
            items: items
        };

        console.log('Sending checkout data:', checkoutData);
        console.log('Using token:', token ? 'Token exists' : 'No token');

        // Send checkout request to backend
        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(checkoutData)
        })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (response.ok) {
                    return response.json();
                } else {
                    // Try to get error message from response
                    return response.text().then(errorText => {
                        console.error('Error response:', errorText);
                        console.error('Response status:', response.status);

                        if (response.status === 401) {
                            throw new Error('Du må være logget inn for å bestille');
                        } else if (response.status === 403) {
                            throw new Error('Du har ikke tilgang til å bestille');
                        } else if (response.status === 500) {
                            throw new Error(`Server-feil: ${errorText}`);
                        } else {
                            throw new Error(`Feil ${response.status}: ${errorText || 'Ukjent feil'}`);
                        }
                    });
                }
            })
            .then(orderResponse => {
                console.log('Order created successfully:', orderResponse);

                // Store cart items for confirmation page (for display purposes)
                localStorage.setItem("purchasedItems", JSON.stringify(cart));

                // Store order details
                localStorage.setItem("orderDetails", JSON.stringify(orderResponse));

                // Clear cart on server
                return fetch('/api/cart/clear', { method: 'POST' });
            })
            .then(() => {
                // Redirect to confirmation page
                window.location.href = "checkout-confirmation.html";
            })
            .catch(error => {
                console.error('Checkout error:', error);

                if (error.message.includes('User not found') || error.message.includes('magnus.lower@gmail.com')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    showLoginModal();
                } else if (error.message.includes('logget inn') || error.message.includes('tilgang')) {
                    showLoginModal();
                } else {
                    alert(error.message || 'Det oppstod en feil under bestillingen. Prøv igjen.');
                }
            });
    });

    // Login Modal Functions
    function showLoginModal() {
        const modal = document.getElementById('login-modal');
        const backdrop = document.getElementById('modal-backdrop');
        
        modal.style.display = 'block';
        backdrop.style.display = 'block';
        
        // Add event listeners for modal actions
        document.getElementById('go-to-login').onclick = () => {
            hideLoginModal();
            window.location.href = 'login.html';
        };
        
        document.getElementById('stay-in-cart').onclick = () => {
            hideLoginModal();
        };
        
        // Close modal when clicking backdrop
        backdrop.onclick = () => {
            hideLoginModal();
        };
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                hideLoginModal();
            }
        });
    }
    
    function hideLoginModal() {
        const modal = document.getElementById('login-modal');
        const backdrop = document.getElementById('modal-backdrop');
        
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    }

    // Create confirmation.js file if it doesn't exist yet
    function createConfirmationJS() {
        fetch('confirmation.js')
            .then(response => {
                if (!response.ok && response.status === 404) {
                    console.log("Creating confirmation.js file");
                    // This would be handled server-side in a real app
                }
            })
            .catch(() => {
                console.log("confirmation.js not found, but will be created separately");
            });
    }

    createConfirmationJS();

    // Initial load
    loadCart();
});