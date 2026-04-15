import { createCipheriv, createDecipheriv } from 'crypto';

const algorithm = 'aes-256-cbc';

function encrypt(message, key, iv) {
    const cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
}

function decrypt(ciphertext, key, iv) {
    const decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


function main() {
    if (process.argv.length !== 6) {
        console.error(`Missing Arguments: myCrypto.msg [-e|-h] [MESSAGE|CIPHERTEXT] [KEY] [INIT_VECTOR]`);
        return;
    }

    switch (process.argv[2]) {
        case '-e':
            try {
                const encryption = encrypt(...process.argv.slice(3));
                console.log(encryption);
            } catch (error) {
                console.error(error);
            }
            break
        case '-d':
            try {
                const decryption = decrypt(...process.argv.slice(3));
                console.log(decryption);
            } catch (error) {
                console.error(error);
            }
            break
        default:
            console.error(`Invalid option: ${process.argv[2]}`);
            return;
    }
}

main();