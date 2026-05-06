import Database from 'better-sqlite3';
import argon2 from 'argon2';

const db = new Database('bank.db');
db.pragma('journal_mode = WAL');

try {
    db.prepare(`CREATE TABLE accounts (
        id text primary key, owner text, balance integer,
        foreign key(owner) references users(email)) `)
        .run()

    db.prepare('INSERT INTO accounts VALUES (?, ?, ?)')
        .run('100', 'alice@example.com', 7500)

    db.prepare('INSERT INTO accounts VALUES (?, ?, ?)')
        .run('190', 'alice@example.com', 200)

    db.prepare('INSERT INTO accounts VALUES (?, ?, ?)')
        .run('998', 'bob@example.com', 1000)
} catch (error) {
} finally {
    db.close();
}