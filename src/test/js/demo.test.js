const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {randomUUID} = require('node:crypto');

class Element {
    constructor(tag = 'div') {
        this.tagName = tag;
        this.children = [];
        this.style = {};
        this.dataset = {};
        this.attributes = {};
        this.listeners = {};
        this.className = '';
        this.textContent = '';
        this.value = '';
        this.disabled = false;
        this.classList = {
            contains: name => this.className.split(' ').includes(name),
            add: name => { if (!this.classList.contains(name)) this.className += ' ' + name; },
            remove: name => { this.className = this.className.split(' ').filter(x => x !== name).join(' '); },
            toggle: (name, on) => on ? this.classList.add(name) : this.classList.remove(name)
        };
    }
    append(...nodes) { this.children.push(...nodes); }
    appendChild(node) { this.append(node); }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(event, fn) { this.listeners[event] = fn; }
    setAttribute(name, value) { this.attributes[name] = value; }
    querySelectorAll(selector) {
        return selector === '.product' ? this.children.filter(node => node.classList?.contains('product')) : this.children;
    }
    querySelector() { return this.children[0] || null; }
    getClientRects() { return [{}]; }
    focus() { this.focused = true; }
}

function storage() {
    const values = new Map();
    return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key)};
}
function harness(fetch) {
    const nodes = new Map(), ready = [], alerts = [];
    const node = id => {
        if (!nodes.has(id)) nodes.set(id, new Element());
        return nodes.get(id);
    };
    const context = {
        window: {location: {origin: 'http://localhost', href: '/'}, innerWidth: 1000, addEventListener() {}},
        document: {
            createElement: tag => new Element(tag), createTextNode: text => ({textContent: text}),
            getElementById: node, querySelector: selector => node(selector), body: new Element(),
            addEventListener: (event, fn) => { if (event === 'DOMContentLoaded') ready.push(fn); }
        },
        localStorage: storage(), sessionStorage: storage(), crypto: {randomUUID},
        URL, TextEncoder, fetch, console, alert: message => alerts.push(message),
        setTimeout: (fn, delay) => { if (!delay || delay === 10) fn(); }
    };
    vm.createContext(context);
    const load = file => vm.runInContext(fs.readFileSync('src/main/resources/static/js/' + file, 'utf8'), context);
    load('global/demo.js');
    context.Demo = context.window.Demo;
    return {context, node, alerts, load, start: () => ready.forEach(fn => fn())};
}
const response = (data, status = 200) => ({ok: status < 400, status, json: async () => data});
const tick = () => new Promise(setImmediate);
const cart = [{id: 1, name: '<img src=x onerror=alert(1)>', imageUrl: 'javascript:alert(1)', price: 10, quantity: 1}];

test('API errors preserve status and fields; authenticated 401 clears stale credentials', async () => {
    const h = harness(async () => response({message: 'Please log in', errors: {}}, 401));
    h.context.localStorage.setItem('token', 'expired');
    h.context.localStorage.setItem('user', '{}');
    await assert.rejects(h.context.Demo.request('/api/checkout', {headers: {Authorization: 'Bearer expired'}}),
        error => error.status === 401 && error.message === 'Please log in');
    assert.equal(h.context.localStorage.getItem('token'), null);
});

test('product data is rendered as text and unsafe image protocols are rejected', async () => {
    const h = harness(async url => response(url === '/api/products' ? cart : []));
    h.load('global/script.js'); h.start(); await tick();
    const product = h.node('product-list').children[0];
    assert.equal(product.children[0].textContent, cart[0].name);
    assert.equal(product.children[1].src, '/images/all-products.jpg');
    assert.equal(product.children[0].children.length, 0);
});

test('failed add-to-cart response never displays success', async () => {
    const h = harness(async url => url.startsWith('/api/cart/add')
        ? response({message: 'Out of stock'}, 409) : response([]));
    h.load('global/script.js'); h.start(); await tick();
    await h.context.window.addToCart(1);
    assert.equal(h.node('cart-notification').classList.contains('show'), false);
    assert.deepEqual(h.alerts, ['Out of stock']);
});

function checkoutHarness(fetch) {
    const h = harness(fetch);
    h.context.localStorage.setItem('token', 'demo-token');
    h.context.localStorage.setItem('user', JSON.stringify({email: 'demo@example.com'}));
    h.load('pages/cart/cart.js'); h.start();
    return h;
}

test('checkout ignores repeated clicks while a request is pending', async () => {
    let finish, requests = 0;
    const h = checkoutHarness(async url => {
        if (url === '/api/cart') return response(cart);
        requests++;
        return new Promise(resolve => { finish = resolve; });
    });
    await tick();
    const click = h.node('checkout-button').listeners.click;
    const first = click(); await tick();
    await click();
    assert.equal(requests, 1);
    assert.equal(h.node('checkout-button').disabled, true);
    finish(response({orderNumber: 'DEMO1234', totalAmount: 59}));
    await first;
    assert.equal(h.context.window.location.href, '/html/order/checkout-confirmation.html');
});

test('lost checkout response retains the same request ID on retry', async () => {
    const ids = [];
    const h = checkoutHarness(async (url, options) => {
        if (url === '/api/cart') return response(cart);
        ids.push(JSON.parse(options.body).requestId);
        if (ids.length === 1) throw new Error('Connection lost');
        return response({orderNumber: 'DEMO1234', totalAmount: 59});
    });
    await tick();
    await h.node('checkout-button').listeners.click();
    await h.node('checkout-button').listeners.click();
    assert.equal(ids.length, 2);
    assert.equal(ids[0], ids[1]);
});

test('confirmed checkout survives storage failure and does not issue a cleanup request', async () => {
    const urls = [];
    const h = checkoutHarness(async url => {
        urls.push(url);
        return response(url === '/api/cart' ? cart : {orderNumber: 'DEMO1234', totalAmount: 59});
    });
    await tick();
    h.context.localStorage.setItem = () => { throw new Error('Storage unavailable'); };
    await h.node('checkout-button').listeners.click();
    assert.equal(h.node('cart-message').textContent.includes('DEMO1234'), true);
    assert.equal(h.node('cart-message').textContent.includes('registrert'), true);
    assert.equal(urls.includes('/api/cart/clear'), false);
});

test('dialog handles Escape and restores the opening control', () => {
    const h = harness(async () => response([]));
    const trigger = new Element('button'), modal = new Element();
    h.context.document.activeElement = trigger;
    const dialog = h.context.Demo.dialog(modal);
    dialog.open();
    assert.equal(modal.style.display, 'block');
    modal.listeners.keydown({key: 'Escape', preventDefault() {}});
    assert.equal(modal.style.display, 'none');
    assert.equal(trigger.focused, true);
});


test('dialog restores an explicit visible opener when launched from a hidden menu', () => {
    const h = harness(async () => response([]));
    const icon = new Element('button'), hiddenMenuItem = new Element('a'), modal = new Element();
    h.context.document.activeElement = hiddenMenuItem;
    const dialog = h.context.Demo.dialog(modal);
    dialog.open(icon);
    dialog.close();
    assert.equal(icon.focused, true);
    assert.notEqual(hiddenMenuItem.focused, true);
});
