import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { customAlphabet } from 'nanoid';

// nanoids instead of digits for randomness and to not leak the database size
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// this should be in a .env file before doing git commits
const SECRET = 'bfg28y7efg238re7r6t32gfo23vfy7237yibdyo238do2v3';

let db;

export async function getUserWithCredentials(email, password) {
    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        // query db for account with matching email
        // parameterized queries to prevent SQL injection attacks
        const stmt = db.prepare('SELECT email, name, password FROM users where email=?')
        const row = stmt.get(email);
        
        if (!row) {
            // prevent timing attacks by doing password hash verification for failed queries
            const dummyPassword = '$argon2id$v=19$m=65536,t=3,p=4$IGBa7Ib/ScgzWO9x2RUBqA$hPsnSe9h8F/ZFkrBnb5Q5N+Rm5STaGkXLWds8UYYSek';
            await argon2.verify(dummyPassword, password);
            return undefined;
        }

        if (!await argon2.verify(row.password, password)) {
            return undefined;
        }

        return { email: row.email, name: row.name, token: createToken(email) };
    } catch (error) {
    } finally {
        db ? db.close() : null;
    }
}

export function loggedIn(req, res) {
    const token = req.cookies.authToken;

    // check for existing valid auth token in the request cookies, return false if there is an invalid auth token
    try {
        const data = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
        res.locals.user = data.sub;
        res.locals.id = data.id;
        return true;
    } catch (error) {
        if (error === 'JsonWebTokenError') {
            return false;
        }
    }
}

export function createToken(email) {
    const now = Date.now();
    const exp = Math.floor(now / 1000) + (60 * 60);

    // create a token with email, creation time, expiration and sign it
    const payload = { sub: email, id: getAccountNumber(email), iat: now, exp: exp };
    const token = jwt.sign(payload, SECRET);

    return token;
}

export function getAccountNumber(email) {
    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        // query db for account with matching email
        // parameterized queries to prevent SQL injection attacks
        const stmt = db.prepare('SELECT id FROM accounts where owner=?');
        const row = stmt.get(email);

        return row ? row.id : undefined;
    } catch (error) {
    } finally {
        db ? db.close() : null;
    }
}

export async function createAccount(email, password, name) {
    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        let id = undefined;

        do {
            id = nanoid();
            id = id.substring(0, 4) + '-' + id.substring(4);
        } while (db.prepare('SELECT id from accounts where id=?').get(id));

        const hash = await argon2.hash(password);

        const usersInsert = db.prepare('INSERT INTO users VALUES (?, ?, ?)');
        const accountsInsert = db.prepare('INSERT INTO accounts VALUES (?, ?, ?)');

        const create = db.transaction(() => {
            usersInsert.run(email, name, hash);
            accountsInsert.run(id, email, 500);
        });

        create();
        return true;
    } catch (error) {
        return false;
    } finally {
        db ? db.close() : null;
    }
}

export function deleteAccount(email) {
    try {
        db = new Database('bin/bank.db');
        db.pragma('journal_mode = WAL');

        const deleteUser = db.prepare('DELETE FROM users WHERE email=?');
        const deleteAccount = db.prepare('DELETE FROM accounts WHERE owner=?');

        const del = db.transaction(() => {
            deleteAccount.run(email);
            deleteUser.run(email);
        });

        del();
    }
    catch (error) {
    }
    finally {
        db ? db.close() : null;
    }
}