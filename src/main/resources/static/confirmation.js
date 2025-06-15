document.addEventListener("DOMContentLoaded", () => {
    // Get purchased items from localStorage
    const purchasedItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]");
    const purchasedItemsContainer = document.getElementById("purchased-items");

    // Clear cart on server when order is complete
    fetch('/api/cart/clear', { method: 'POST' })
        .catch(err => console.error("Error clearing cart:", err));

    // Display purchased items
    if (purchasedItems.length === 0) {
        purchasedItemsContainer.innerHTML = "<p>Ingen varer funnet.</p>";
    } else {
        let totalAmount = 0;
        const itemsHtml = purchasedItems.map(item => {
            let price = typeof item.price === "object" && item.price !== null
                ? (item.price.value || item.price)
                : item.price;

            totalAmount += price * item.quantity;

            return `
                <div class="purchased-item">
                    <img src="${item.imageUrl}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Pris: kr ${price.toFixed(2)}</p>
                        <p>Antall: ${item.quantity}</p>
                        <p>Sum: kr ${(price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
        }).join('');

        purchasedItemsContainer.innerHTML = itemsHtml;

        // Add shipping and calculate total
        const shipping = 49.00;
        document.getElementById("order-total").innerHTML = `
            <div class="total-line">
                <span>Sum varer:</span>
                <span>kr ${totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Frakt:</span>
                <span>kr ${shipping.toFixed(2)}</span>
            </div>
            <div class="total-line grand-total">
                <span>Totalt:</span>
                <span>kr ${(totalAmount + shipping).toFixed(2)}</span>
            </div>
        `;
    }

    // Back to store button
    document.getElementById("back-to-store-button").addEventListener("click", () => {
        // Clear localStorage and redirect to store
        localStorage.removeItem("purchasedItems");
        window.location.href = "index.html";
    });
});