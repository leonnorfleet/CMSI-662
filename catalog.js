import jsonwebtoken from "jsonwebtoken";

import { ensure, Quantity, Identifier } from "./utils.js";
import { type } from "node:os";
import { validateHeaderName } from "node:http";


const catalogItems = new Map([
    ['bread', 2.00],
    ['milk', 3.50],
    ['eggs', 4.25],
    ['cheese', 5.00],
    ['butter', 4.50],
    ['apples', 3.00],
    ['bananas', 1.50],
    ['pasta', 1.25],
    ['rice', 2.10],
    ['water', 1.00]
]);

export function itemExists(item) {
    ensure(catalogItems.has(item), `Item ${item} is not in the catalog`);
}

export function price(item) {
    itemExists(item);
    return catalogItems.get(item);
}

export function upsertItem(token, item, price) {
    jsonwebtoken.verify(token, 'secret');
    ensure(typeof item === 'string', 'item must be a string.');
    ensure(typeof price === 'number' && price >= 0 && price < 1000000, 'price must be a non-negative number.');
    catalogItems.set(item, price);
}