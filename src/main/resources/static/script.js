document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    fetch("/api/products")
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById("product-list");
            products.forEach(product => {
                const productElement = document.createElement("div");
                productElement.className = "product";
                productElement.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p><strong>$${product.price}</strong></p>
                    <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to cart</button>
                `;
                productList.appendChild(productElement);
            });
        })
        .catch(error => console.error("Error fetching products:", error));

    window.addToCart = (id, name, price) => {
        const item = cart.find(product => product.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    document.getElementById("view-cart").addEventListener("click", () => {
        window.location.href = "cart.html";
    });
});