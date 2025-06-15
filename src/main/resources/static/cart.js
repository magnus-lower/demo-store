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

    // Add checkout button functionality
    document.getElementById("checkout-button").addEventListener("click", () => {
        // Store cart items in localStorage before redirecting
        localStorage.setItem("purchasedItems", JSON.stringify(cart));

        // Redirect to confirmation page
        window.location.href = "checkout-confirmation.html";
    });

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