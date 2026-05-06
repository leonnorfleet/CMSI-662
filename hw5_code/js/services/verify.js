export function verifyEmail(email) {
    let minChars = 5;
    let maxChars = 30;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/;
    if (email.length < minChars || email.length > maxChars || !emailRegex.test(email)) {
        return false;
    }

    return true;
}

export function verifyPassword(password) {
    let minChars = 10;
    let maxChars = 128;

    const whitespaceRegex = /\s/;

    if (password.length < minChars) {
        return `Password field length is too short`;
    }
    else if (password.length > maxChars) {
        return `Password field length is too long`;
    }
    else if (whitespaceRegex.test(password)) { // no spaces, tabs, newlines in or around passwords
        return 'No whitespace';
    }

    return undefined;
}

export function verifyName(name) {
    let minChars = 1;
    let maxChars = 15;

    const nameRegex = /^[a-zA-Z]+$/;

    if (name.length < minChars) {
        return `Name field(s) length is too short`;
    }
    else if (name.length > maxChars) {
        return `Name field(s) length is too long`;
    }
    else if (!nameRegex.test(name)) {
        return 'Letters only in name field(s)';
    }

    return undefined;
}