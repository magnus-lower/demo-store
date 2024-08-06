document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartUI() {
        const cartItems = document.getElementById("cart-items");

        // Store the previous state of the cart
        const previousCartItems = Array.from(cartItems.children).map(child => ({
            id: parseInt(child.dataset.id),
            quantity: parseInt(child.querySelector(".quantity").textContent)
        }));

        // Check for changes and only update necessary elements
        cart.forEach((item, index) => {
            const existingItem = previousCartItems.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                if (existingItem.quantity !== item.quantity) {
                    // Update quantity
                    const quantityElement = cartItems.querySelector(`[data-id="${item.id}"] .quantity`);
                    quantityElement.textContent = item.quantity;
                }
            } else {
                // Add new item
                const cartItem = document.createElement("li");
                cartItem.dataset.id = item.id;
                cartItem.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}" style="width:50px; height:auto;">
                    ${item.name} - $${item.price} 
                    <button class="decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="increase" data-index="${index}">+</button>
                `;
                cartItems.appendChild(cartItem);
            }
        });

        // Remove items that are no longer in the cart
        previousCartItems.forEach(prevItem => {
            if (!cart.find(item => item.id === prevItem.id)) {
                const itemToRemove = cartItems.querySelector(`[data-id="${prevItem.id}"]`);
                itemToRemove.remove();
            }
        });
    }

    document.getElementById("cart-items").addEventListener("click", (event) => {
        const target = event.target;
        const index = target.dataset.index;

        if (target.classList.contains("increase")) {
            cart[index].quantity++;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }

        if (target.classList.contains("decrease")) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    });

    // Initial cart display
    updateCartUI();

    document.getElementById("back-to-store").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
