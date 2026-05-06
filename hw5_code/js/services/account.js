import Database from 'better-sqlite3';

let db;

export function getBalance(accountNumber, owner) {
    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        // query db, return balance if it exists
        const stmt = db.prepare('SELECT balance FROM accounts where id=? and owner=?')
        const row = stmt.get(accountNumber, owner);

        return row ? row.balance : undefined;
    } catch (error) {
    } finally {
        db ? db.close() : null;
    }
}

export function doTransfer(source, target, amount) {

    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        // query db, check if target account exists (source account is checked in the transfer post request)
        const stmt = db.prepare('SELECT id from accounts where id=?')
        const row = stmt.get(target);

        if (!row) {
            return false;
        }

        // decrement from source then increment target (parameterized queries to prevent SQL injection attacks)
        const decrement = db.prepare('UPDATE accounts SET balance=balance-? where id=?');
        const increment = db.prepare('UPDATE accounts SET balance=balance+? where id=?');
        const transfer = db.transaction(() => {
            decrement.run(amount, source);
            increment.run(amount, target);
        });

        transfer();
        return true;
    } catch (error) {
    } finally {
        db ? db.close() : null;
    }
}