document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/products")
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById("product-list");
            products.forEach(product => {
                const productElement = document.createElement("div");
                productElement.className = "product";
                productElement.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p><strong>$${product.price}</strong></p>
                `;
                productList.appendChild(productElement);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
});
