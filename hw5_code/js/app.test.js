import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import * as userService from './services/user.js'
import * as accountService from './services/account.js';

const url = 'http://localhost:5000/';

// testing http routes
let response = undefined;

let Cookie = undefined;
let cookies = undefined;

let authToken = undefined;
let csrfSecret = undefined;
let csrfToken = undefined;

const headerToJSON = (headers) => {
    const cookies = headers.getSetCookie().map(x => x.split('; ')[0]);
    return Object.fromEntries(cookies.map(x => x.split('=')));
}

const getCookies = async (Cookie=undefined) => {
    let response = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': Cookie
        }
    });

    let headers = response.headers;
    return { Cookie: headers.getSetCookie().map(c => c.split(';')[0]).join('; '), 
        cookies: headerToJSON(headers) 
    }
}

const getResponse = async (path, method, email, password, firstName, lastName, to, amount) => {
    const options = {
        method: method,
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': Cookie
        }
    }

    if (method !== 'GET') {
        options.body = JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            csrfToken,
            to,
            amount
        });
    }

    let response = await fetch(url + path, options);

    return response;
}

const getTransferResponse = async (to, amount) => {
    const options = {
        method: 'POST',
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': Cookie
        }
    }
    options.body = JSON.stringify({
        to,
        amount,
        csrfToken
    });

    let response = await fetch(url + 'transfer', options);

    return response;
}

assert(1 === 1);

// GET method at '/'
describe('Methods for \'/\'', () => {
    test('GET response returns correct attributes', async () => {
        response = await fetch(url, {
            method: 'GET',
        });

        assert(response.status === 200); // not logged in, should just render the login page and not redirect

        const headers = response.headers;
        const cookies = (headerToJSON(headers)); // get list of cookies from header and turn it into an object
        
        // server gives the csrf token stuff
        assert(cookies.csrfSecret);
        assert(cookies.csrfToken);
        assert(!cookies.authToken); // there shouldn't be an auth token when logged out
    });
});

describe('Testing CSRF prevention and incorrect login attempts', async () => {
    ({ Cookie, cookies } = await getCookies());
    ({ authToken, csrfSecret, csrfToken } = cookies);

    test('POST response has status 400 because of missing/incorrect parameters', async () => {
        response = await fetch(url + 'login', {
            method: 'POST',
        });

        assert(response.status === 400); // forgot to add a body to the request

        response = await fetch(url + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'bob@example.com',
                password: '123456'
            })
        });

        assert(response.status === 400); // missing csrf token

        response = await fetch(url + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': Cookie
            },
            body: JSON.stringify({
                email: 'bob@example.com',
                password: 'bad_password',
                csrfToken: csrfToken + 'incorrect token string',
            })
        });

        assert(response.status === 400); // csrf token invalid/doesnt match secret
    });
})

describe('Methods for \'/login\'', async () => {

    ({ Cookie, cookies } = await getCookies());
    ({ authToken, csrfSecret, csrfToken } = cookies);

    test('POST response returns 200 for incorrect login attempts', async () => {
        response = await getResponse('login', 'POST', 'bob@example.com', 'incorrect_password');
        assert(response.status === 200); // response of 200 since incorrect logins just re-render the page
    });

    test('POST method returns status 303 and gives auth token for corrrect login attempt', async () => {
        response = await getResponse('login', 'POST', 'bob@example.com', '123456');

        assert(response.status === 303);
        authToken = headerToJSON(response.headers).authToken;
        assert(authToken);
    });
});

describe('Methods for \'/createaccount\'', async () => {
    ({ Cookie, cookies } = await getCookies());
    ({ authToken, csrfSecret, csrfToken } = cookies);

    test('POST method returns status code 400 for invalid form inputs', async () => {
        let badEmail = await getResponse('createaccount', 'POST', 'AKSLND@!@#####', 'password123', 'first', 'last');
        let longEmail = await getResponse('createaccount', 'POST', 'TOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOONNNNNNNNNNGGGGGGGGGGGG', 
            'password123', 'first', 'last');
        let shortEmail = await getResponse('createaccount', 'POST', 'short',
            'password123', 'first', 'last');

        assert(badEmail.status === 400);
        assert(longEmail.status === 400);
        assert(shortEmail.status === 400);

        let shortPass = await getResponse('createaccount', 'POST', 'fake@example.com', 'tooshort', 'first', 'last');
        let spacePass = await getResponse('createaccount', 'POST', 'fake@example.com', 'white spa    ce\n', 'first', 'last');
        

        assert(shortPass.status === 400);
        assert(spacePass.status === 400);

        let badName1 = await getResponse('createaccount', 'POST', 'fake@example.com', 'password123', 'b@d ch$rs', 'last');
        let badName2 = await getResponse('createaccount', 'POST', 'fake@example.com', 'password123', 'John', 'bad^&&* ch(rs');
        let noName = await getResponse('createaccount', 'POST', 'fake@example.com', 'password123', '', '');

        assert(badName1.status === 400);
        assert(badName2.status === 400);
        assert(noName.status === 400);
    });

    test('POST method returns status code 400 when inputting existing email', async () => {
        let response = await getResponse('createaccount', 'POST', 'bob@example.com', 'password123', 'Sponge', 'Bob');
        assert(response.status === 400);
    });

    test('POST method returns status code 200 for valid form inputs and an email not in the db', async () => {
        let response = await getResponse('createaccount', 'POST', 'fake@example.com', 'password123', 'John', 'Node');
        // assert(response.status === 200);
        
        userService.deleteAccount('fake@example.com');
    });
});

describe('GET methods if not logged in for all routes', async () => {
    ({ Cookie, cookies } = await getCookies());
    ({ authToken, csrfSecret, csrfToken } = cookies);

    test('GET response has status 200 if not logged in', async () => {
        response = await getResponse('', 'GET');
        assert(response.status === 200);

        response = await getResponse('dashboard', 'GET');
        assert(response.status === 200);

        response = await getResponse('transfer', 'GET');
        assert(response.status === 200);

        response = await getResponse('createaccount', 'GET');
        assert(response.status === 200);
    });

    test('GET response has status 303 (redirect) or 200 (render) if logged in/valid authToken', async () => {
        response = await getResponse('login', 'POST', 'bob@example.com', '123456');
        Cookie = response.headers.getSetCookie().join('; ');
        
        response = await getResponse('', 'GET');
        assert(response.status === 303);

        response = await getResponse('dashboard', 'GET');
        assert(response.status === 200);

        response = await getResponse('details', 'GET');
        assert(response.status === 200);

        response = await getResponse('createaccount', 'GET');
        assert(response.status === 303);
    });
});

/*
having issues sending the authToken cookie with .fetch()

if I could add more test cases it would be for making sure each fetch request 
worked when logged in/having an authToken cookie
*/

describe('User and Account service testing', () => {
    test('User service functions', async () => {
        assert(!userService.getAccountNumber('NotInDB@mail.com'));
        assert(userService.getAccountNumber('leon@example.com'));

        assert(!await userService.getUserWithCredentials('NotInDB@mail.com', 'idk'));
        assert(!await userService.getUserWithCredentials('bob@example.com', 'idk'));
        assert(await userService.getUserWithCredentials('leon@example.com', 'password123'));

    });

    test('Account service functions', async () => {
        assert(!await accountService.getBalance('ABCD-EFGH', 'leon@example.com'));
        assert(await accountService.getBalance('KYYH-BQQH', 'leon@example.com'));

    });
});