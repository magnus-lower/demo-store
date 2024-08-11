document.addEventListener("DOMContentLoaded", () => {
    // Load the cart from localStorage or initialize it as an empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to update the cart UI based on the current state of the cart
    function updateCartUI() {
        const cartItems = document.getElementById("cart-items");
        cartItems.innerHTML = ''; // Clear the cart items list

        if (cart.length === 0) {
            // Display a message if the cart is empty
            cartItems.innerHTML = '<li>Handlekurven er tom</li>';
        } else {
            // Loop through each item in the cart and create its corresponding UI element
            cart.forEach((item, index) => {
                const cartItem = document.createElement("li");
                cartItem.dataset.id = item.id;
                cartItem.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}" style="width:50px; height:auto;">
                    ${item.name} - kr ${item.price} 
                    <button class="decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="increase" data-index="${index}">+</button>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }

    // Event listener for handling clicks on increase and decrease buttons
    document.getElementById("cart-items").addEventListener("click", (event) => {
        const target = event.target;
        const index = target.dataset.index;

        // Increase quantity button functionality
        if (target.classList.contains("increase")) {
            cart[index].quantity++;
            localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
            updateCartUI(); // Update the UI
        }

        // Decrease quantity button functionality
        if (target.classList.contains("decrease")) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1); // Remove item from cart if quantity is 1 and decrease is clicked
            }
            localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
            updateCartUI(); // Update the UI
        }
    });

    // Initial cart display when the page loads
    updateCartUI();

    // Event listener for the "back to store" button
    document.getElementById("back-to-store").addEventListener("click", () => {
        window.location.href = "index.html"; // Navigate back to the main store page
    });
});