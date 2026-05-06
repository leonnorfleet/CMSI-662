import Database from 'better-sqlite3';
import argon2 from 'argon2';

const db = new Database('bank.db');
db.pragma('journal_mode = WAL');

try {
    db.prepare(`CREATE TABLE users (email text primary key, name text, password text)`)
        .run();

    db.prepare('INSERT INTO users VALUES (?, ?, ?)')
        .run('alice@example.com', 'Alice Xu', (await argon2.hash('123456')));

    db.prepare('INSERT INTO users VALUES (?, ?, ?)')
        .run('bob@example.com', 'Bobby Tables', (await argon2.hash('123456')));

} catch (error) {
    console.log(error)
} finally {
    db.close();
}
