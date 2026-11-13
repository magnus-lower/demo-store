document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let checkoutPending = false;
    let mutationPending = false;
    const checkoutButton = document.getElementById('checkout-button');
    const message = document.getElementById('cart-message');
    const loginDialog = Demo.dialog(document.getElementById('login-modal'),
        document.getElementById('modal-backdrop'));

    function showError(error) {
        message.textContent = error.message;
    }

    async function loadCart() {
        try {
            cart = await Demo.request('/api/cart');
            message.textContent = '';
            updateCartUI();
        } catch (error) {
            checkoutButton.disabled = true;
            showError(error);
        }
    }

    function updateCartUI() {
        const list = document.getElementById('cart-items');
        list.replaceChildren();
        const empty = cart.length === 0;
        document.getElementById('empty-cart-message').style.display = empty ? 'block' : 'none';
        for (const id of ['cart-items', 'back-to-store', 'clear-cart', 'cart-total', 'order-summary', 'checkout-button']) {
            document.getElementById(id).style.display = empty ? 'none' : 'block';
        }
        let total = 0, count = 0;
        for (const item of cart) {
            const row = Demo.element('li');
            row.dataset.id = item.id;
            const image = Demo.image(item.imageUrl, item.name);
            image.style.width = '50px';
            image.style.height = 'auto';
            row.append(image, document.createTextNode(item.name + ' - kr ' + Number(item.price).toFixed(2)));
            const controls = Demo.element('div', 'quantity-controls');
            for (const [className, label, name] of [
                ['decrease', '-', 'Reduser antall'], ['quantity', item.quantity, ''],
                ['increase', '+', 'Øk antall'], ['remove-item', '×', 'Fjern vare']
            ]) {
                const control = Demo.element(className === 'quantity' ? 'span' : 'button', className, label);
                if (name) {
                    control.type = 'button';
                    control.setAttribute('aria-label', name + ': ' + item.name);
                    control.addEventListener('click', () => changeCart(item, className));
                }
                controls.append(control);
            }
            row.append(controls);
            list.append(row);
            count += item.quantity;
            total += Number(item.price) * item.quantity;
        }
        document.getElementById('items-count').textContent = count;
        document.getElementById('items-total').textContent = 'kr ' + total.toFixed(2);
        document.getElementById('final-total').textContent = 'kr ' + (total + 49).toFixed(2);
        document.getElementById('cart-total').textContent = 'Totalt: kr ' + total.toFixed(2);
        checkoutButton.disabled = checkoutPending || mutationPending;
    }

    async function changeCart(item, action) {
        if (checkoutPending || mutationPending) return;
        let url = '/api/cart/clear';
        if (item) {
            url = action === 'remove-item' || (action === 'decrease' && item.quantity === 1)
                ? '/api/cart/remove?productId=' + item.id
                : '/api/cart/add?productId=' + item.id + '&quantity=' + (action === 'increase' ? 1 : -1);
        }
        mutationPending = true;
        checkoutButton.disabled = true;
        try {
            cart = await Demo.request(url, {method: 'POST'});
            message.textContent = '';
        } catch (error) {
            showError(error);
        } finally {
            mutationPending = false;
            updateCartUI();
        }
    }

    document.getElementById('clear-cart').addEventListener('click', () => changeCart());
    for (const id of ['back-to-store', 'back-to-store-empty']) {
        document.getElementById(id).addEventListener('click', () => { window.location.href = '/index.html'; });
    }
    document.getElementById('go-to-login').addEventListener('click', () => {
        window.location.href = '/html/auth/login.html';
    });

    checkoutButton.addEventListener('click', async () => {
        if (checkoutPending || mutationPending || cart.length === 0) return;
        const token = localStorage.getItem('token');
        if (!token) {
            loginDialog.open();
            return;
        }
        checkoutPending = true;
        checkoutButton.disabled = true;
        message.textContent = 'Demobestillingen behandles…';
        let order;
        try {
            const items = Object.fromEntries(cart.map(item => [item.id, item.quantity]));
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const signature = JSON.stringify({user: user.email, items});
            // Keep the ID after a lost response so a retry returns the same order.
            const saved = JSON.parse(sessionStorage.getItem('pendingCheckout') || 'null');
            const pending = saved?.signature === signature ? saved : {signature, requestId: crypto.randomUUID()};
            sessionStorage.setItem('pendingCheckout', JSON.stringify(pending));
            order = await Demo.request('/api/checkout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
                body: JSON.stringify({
                    requestId: pending.requestId,
                    street: 'Testgate 1', city: 'Oslo', zipCode: '0001', country: 'Norge', items
                })
            });
        } catch (error) {
            showError(error);
            if (error.status === 401) loginDialog.open();
            checkoutPending = false;
            checkoutButton.disabled = false;
            return;
        }

        // A confirmed order stays successful even if browser storage is unavailable.
        message.textContent = 'Demobestilling ' + order.orderNumber + ' er registrert. Ingen betaling eller levering skjer.';
        try {
            sessionStorage.removeItem('pendingCheckout');
            localStorage.setItem('purchasedItems', JSON.stringify(cart));
            localStorage.setItem('orderDetails', JSON.stringify(order));
            window.location.href = '/html/order/checkout-confirmation.html';
        } catch {
            cart = [];
            updateCartUI();
        }
    });

    loadCart();
});
