document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartUI() {
        const cartItems = document.getElementById("cart-items");
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement("li");
            cartItem.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
            cartItems.appendChild(cartItem);
        });
    }

    updateCartUI();

    document.getElementById("back-to-store").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
