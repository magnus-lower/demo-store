document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartUI() {
        const cartItems = document.getElementById("cart-items");
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItem = document.createElement("li");
            cartItem.innerHTML = `
                ${item.name} - $${item.price} 
                <button onclick="decreaseQuantity(${index})">-</button>
                ${item.quantity}
                <button onclick="increaseQuantity(${index})">+</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    window.increaseQuantity = (index) => {
        cart[index].quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    };

    window.decreaseQuantity = (index) => {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        } else {
            removeFromCart(index); // Remove item if quantity goes below 1
        }
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    };

    updateCartUI();

    document.getElementById("back-to-store").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
