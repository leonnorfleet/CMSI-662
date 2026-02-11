export class Quantity {
    constructor(num) {
        ensure(typeof num === 'number', 'Input must be a number.')
        ensure(num >= 0, 'Quantity must be a non-negative integer.');
        ensure(Number.isInteger(num), 'Input must be an integer.');
        ensure(num <= 1000, 'Quantity is too large.');

        this.value = num;
        Object.freeze(this);
    }
}

export class Identifier {
    constructor(name) {
        ensure(typeof name === 'string', 'Input must be a valid string.');
        ensure(name.length <= 20, 'Input length too large.');

        this.value = name;
        Object.freeze(this);
    }
}

export function ensure(condition, msg) {
    if (!condition) {
        throw Error(msg);
    }
}