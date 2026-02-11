import Crypto from 'crypto'

import { itemExists, price } from './catalog.js';
import { ensure, Quantity, Identifier } from './utils.js';


export class Cart {
    #items;

    constructor(customerId) {
        ensure(customerId instanceof Identifier, 'Identifier type required for customerId.');

        const valid_id = /^[A-Z]{3}[0-9]{5}[A-Z]{2}\-[A|Q]$/;
        ensure(valid_id.test(customerId.value), `Invalid customerId: ${customerId.value}`);

        this.id = Crypto.randomUUID();
        this.customerId = customerId.value;
        this.#items = new Map();

        Object.freeze(this); // prevent properties from being added later
    }

    get items() {
        return new Map(this.#items);
    }

    setItemQty(item, amt) {
        ensure(item instanceof Identifier, 'Identifier type required for item.');
        ensure(amt instanceof Quantity, 'Quantity type required for amt.');

        item = item.value;
        amt = amt.value;

        itemExists(item);
        
        this.#items.set(item, amt);
        
        if (this.#items.get(item) === 0) {
            this.#items.delete(item);
        }
    }

    addItemQty(item, amt) {
        ensure(item instanceof Identifier, 'Identifier type required for item.');
        ensure(amt instanceof Quantity, 'Quantity type required for amt.');

        itemExists(item.value);
        const newAmt = (this.items.get(item.value) || 0) + amt.value;
        this.setItemQty(item, new Quantity(newAmt));
    }

    removeItem(item) {
        this.setItemQty(item, new Quantity(0));
    }

    removeItemQty(item, amt) {
        ensure(item instanceof Identifier, 'Identifier type required for item.');
        ensure(amt instanceof Quantity, 'Quantity type required for amt.');
        
        itemExists(item.value);
        const newAmt = (this.items.get(item.value) || 0) - amt.value;
        this.setItemQty(item, new Quantity(newAmt));
    }

    totalCost() {
        let total = 0;
        for (const [item, amt] of this.#items) {
            total += price(item) * amt;
        }

        return total;
    }
}