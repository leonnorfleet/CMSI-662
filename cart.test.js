import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import jsonwebtoken from "jsonwebtoken";

import { Identifier, Quantity } from './utils.js';
import { Cart } from './cart.js';
import { itemExists, price, upsertItem } from './catalog.js';

describe('Quantity and Identifier Constructors', () => {
    test('quantity fails for invalid inputs', () => {
        assert.throws(() => new Quantity('25'));
        assert.throws(() => new Quantity(-1));
        assert.throws(() => new Quantity(Math.pow(-111111111111111111111111111111111111,100)));
        assert.throws(() => new Quantity(2.7));
        assert.throws(() => new Quantity(Math.pow(5000000, 2000)));
    });

    test('identifier fails for invalid inputs', () => {
        assert.throws(() => new Identifier('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        assert.throws(() => new Identifier(hello));
        assert.throws(() => new Identifier(1222));
        assert.throws(() => new Identifier(/^1234$/));
        assert.throws(() => new Identifier(new Quantity(25)));
    });
});

const VALID_CUSTOMER_ID = new Identifier('ABC12345DE-A');
const INVALID_CUSTOMER_ID = new Identifier('BAD-ID!!');

const testCart = new Cart(VALID_CUSTOMER_ID);
const testCart2 = new Cart(new Identifier('QWE09876RT-Q'));

describe('Cart Constructor', () => {
    test('creates a card with a valid customer ID', () => {
        assert(testCart instanceof Cart);
        assert(testCart.customerId === 'ABC12345DE-A');
        assert.throws(() => new Cart(INVALID_CUSTOMER_ID));
    });

    test('generates a valid uuid4 for the cart', () => {
        assert(/^[0-9a-z]{8}-[0-9a-z]{4}-4[0-9a-z]{3}-[8|9|a|b][0-9a-z]{3}-[0-9a-z]{12}$/.test(testCart.id));
    });

    test('cart initialized with empty map', () => {
        assert(testCart.items.size === 0);
    });

    test('generates unique uuid4 for each cart', () => {
        assert(testCart.id !== testCart2.id);
    });
});

describe('Catalog Methods', () => {
    test('itemExists() fails for items not in the catalog', () => {
        assert.throws(() => itemExists('laptop'));
    });

    test('price() gives price of items in catalog only', () => {
        assert(price('eggs') === 4.25);
        assert.throws(() => price('spinach'));
    });

    test('upserts items with valid prices', () => {
        let item = 'spinach';
        let itemPrice = 1.45;

        const token = jsonwebtoken.sign({ item: item, price: itemPrice, time: new Date()}, 'secret');
        upsertItem(token, item, itemPrice);
        
        assert.doesNotThrow(() => itemExists(item));
        assert(price(item) === itemPrice);
    });
});

describe('Cart Methods', () => {
    test('items() returns correct information', () => {
        const items = testCart.items;
        assert.deepStrictEqual(items, testCart.items);
    });

    test('items() is immutable', () => {
        const items = testCart.items;
        const temp = new Map(testCart.items);
        items.set('sugar', 9999);
        assert.deepStrictEqual(temp, testCart.items);
    });

    test('setItemQty() does not set negative values', () => {
        assert.throws(() => testCart.setItemQty('apples', -1));
    });

    test('setItemQty() sets new amount in cart correctly', () => {
        testCart.setItemQty(new Identifier('milk'), new Quantity(4)); // milk count is 4
        assert(testCart.items.get('milk') === 4);
    });

    test('addItemQty() adds new amount to existing item in cart correctly', () => {
        testCart.addItemQty(new Identifier('milk'), new Quantity(4)); // milk count is 8
        assert(testCart.items.get('milk') === 8);
    });

    test('addItemQty() cannot be used to decrement items', () => {
        assert.throws(() => testCart.addItemQty(new Identifier('bread'), new Quantity(-100)));
    });

    test('removeItemQty() removes amount from existing item in cart correctly', () => {
        testCart.removeItemQty(new Identifier('milk'), new Quantity(6)); // milk count is 2
        assert(testCart.items.get('milk') === 2);
    });

    test('removeItemQty() removes item from cart if amount becomes 0', () => {
        testCart.removeItemQty(new Identifier('milk'), new Quantity(2)); // milk count is 0 -> removed from items
        assert(testCart.items.has('milk') === false);
    });

    test('removeItemQty() cannot be used to increment items', () => {
        testCart.setItemQty(new Identifier('butter'), new Quantity(12)); // butter count is 12
        assert.throws(() => testCart.addItemQty(new Identifier('butter'), new Quantity(-15)));
    });

    test('removeItem() removes existing item from cart correctly', () => {
        testCart.removeItem(new Identifier('butter')); // butter count is 0 -> removed from items
        assert(testCart.items.has('butter') === false);
    });

    test('all methods fail if passed item is not in catalog', () => {
        assert.throws(() => testCart.setItemQty(new Identifier('chalk'), new Quantity(1)));
        assert.throws(() => testCart.addItemQty(new Identifier('chalk'), new Quantity(1)));
        assert.throws(() => testCart.removeItem(new Identifier('chalk')));
        assert.throws(() => testCart.removeItemQty(new Identifier('chalk'), new Quantity(1)));
    });

    test('calculates and returns correct total price', () => {
        testCart.addItemQty(new Identifier('apples'), new Quantity(1)); // 3.00
        testCart.addItemQty(new Identifier('milk'), new Quantity(1)); // 3.50
        testCart.addItemQty(new Identifier('eggs'), new Quantity(1)); // 4.25
        testCart.addItemQty(new Identifier('cheese'), new Quantity(1)); // 5.00
        assert(testCart.totalCost() === (3.00 + 3.50 + 4.25 + 5.00));
    })
});