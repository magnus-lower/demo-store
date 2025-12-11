document.addEventListener("DOMContentLoaded", () => {
    // Get purchased items from localStorage (for display)
    const purchasedItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]");
    const orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "{}");
    const purchasedItemsContainer = document.getElementById("purchased-items");

    // Display order number and date if available
    if (orderDetails.orderNumber) {
        const confirmationContainer = document.querySelector('.confirmation-container h1');
        if (confirmationContainer) {
            confirmationContainer.innerHTML = `
                Takk for din bestilling!
                <div style="font-size: 18px; color: #666; margin-top: 10px;">
                    Ordrenummer: ${orderDetails.orderNumber}
                </div>
            `;
        }
    }

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
        const finalTotal = orderDetails.totalAmount || (totalAmount + shipping);

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
                <span>kr ${finalTotal.toFixed ? finalTotal.toFixed(2) : finalTotal}</span>
            </div>
        `;
    }

    // Back to store button
    document.getElementById("back-to-store-button").addEventListener("click", () => {
        // Clear localStorage and redirect to store
        localStorage.removeItem("purchasedItems");
        localStorage.removeItem("orderDetails");
        window.location.href = "/html/product/index.html";
    });

    // Optional: Clear localStorage after a delay to prevent browser back button issues
    setTimeout(() => {
        localStorage.removeItem("purchasedItems");
        localStorage.removeItem("orderDetails");
    }, 30000); // Clear after 30 seconds
});