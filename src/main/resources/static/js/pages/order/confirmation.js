document.addEventListener('DOMContentLoaded', () => {
    let items = [], order = {};
    try {
        items = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        order = JSON.parse(localStorage.getItem('orderDetails') || '{}');
    } catch {
        // The confirmation page remains useful when browser storage is unavailable.
    }
    const container = document.getElementById('purchased-items');
    if (!order.orderNumber) {
        container.textContent = 'Ingen demobestilling å vise. Du finner tidligere bestillinger under kontomenyen.';
    } else {
        document.querySelector('.confirmation-container h1').append(
            Demo.element('div', 'confirmation-number', 'Demobestilling: ' + order.orderNumber));
        for (const item of items) {
            const row = Demo.element('div', 'purchased-item');
            const details = Demo.element('div', 'item-details');
            details.append(Demo.element('h3', '', item.name),
                Demo.element('p', '', 'Pris: kr ' + Number(item.price).toFixed(2)),
                Demo.element('p', '', 'Antall: ' + item.quantity),
                Demo.element('p', '', 'Sum: kr ' + (item.price * item.quantity).toFixed(2)));
            row.append(Demo.image(item.imageUrl, item.name, 'item-image'), details);
            container.append(row);
        }
        const total = document.getElementById('order-total');
        const amount = Number(order.totalAmount);
        for (const [label, value, className] of [
            ['Sum varer:', amount - 49, 'total-line'],
            ['Simulert frakt:', 49, 'total-line'],
            ['Totalt (demo):', amount, 'total-line grand-total']
        ]) {
            const line = Demo.element('div', className);
            line.append(Demo.element('span', '', label), Demo.element('span', '', 'kr ' + value.toFixed(2)));
            total.append(line);
        }
    }
    document.getElementById('back-to-store-button').addEventListener('click', () => {
        localStorage.removeItem('purchasedItems');
        localStorage.removeItem('orderDetails');
        window.location.href = '/index.html';
    });
});
