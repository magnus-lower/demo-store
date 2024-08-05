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
                    <img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:auto;">
                    <p>${product.description}</p>
                    <p><strong>$${product.price}</strong></p>
                    <button onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.imageUrl}')">Add to cart</button>
                `;
                productList.appendChild(productElement);
            });
        })
        .catch(error => console.error("Error fetching products:", error));

    window.addToCart = (id, name, price, imageUrl) => {
        const item = cart.find(product => product.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({ id, name, price, imageUrl, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    document.getElementById("view-cart").addEventListener("click", () => {
        window.location.href = "cart.html";
    });
});
