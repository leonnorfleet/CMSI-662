import express from 'express';
import cookieParser from 'cookie-parser'
import ejs from 'ejs';
import Tokens from 'csrf';

import * as userService from './services/user.js'
import * as accountService from './services/account.js';
import { verifyEmail, verifyName, verifyPassword } from './services/verify.js';

const app = express();
const PORT = 5000;
const tokens = new Tokens(); // csrf token generator


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // parsing cookies middleware

app.engine('html', ejs.renderFile); // setting the view engine to ejs
app.set('view engine', 'html'); // use .html instead of .ejs for templates
app.use(express.static('public')); // css styling stuff

// middleware for giving each user csrf prevention cookies
app.use(async (req, res, next) => {
    // double cookie submit for CSRF prevention
    let secret = req.cookies.csrfSecret;
    let token = req.cookies.csrfToken;

    if (!secret || !token) {
        secret = await tokens.secret();
        token = await tokens.create(secret);

        // per-user secret and token expire after 1 hour
        // http only so secret and token can't be taken from document.cookie
        const HRS = 1;
        res.cookie('csrfSecret', secret, { expires: new Date(Date.now() + HRS * 3600000), httpOnly: true });
        res.cookie('csrfToken', token, { expires: new Date(Date.now() + HRS * 3600000), httpOnly: true });
    }

    res.locals.csrfToken = token; // csrf token is set for the login and transfer templates
    res.locals.error = null; // Default value of error for all templates that go to login
    res.locals.success = null; // default template value for account created success message

    next();
});

app.route('/')
    .get((req, res) => {
        if (!userService.loggedIn(req, res)) {
            res.render('login');
            return;
        }

        res.redirect(303, '/dashboard');
    });

app.route('/login')
    .post(async (req, res) => {
        if (!req.body) {
            // somehow someone sends a request without a body (like using .fetch())
            res.status(400).send('Bad Request');
            return;
        }

        const csrfToken = req.body.csrfToken; // get the csrf token posted by the form
        if (!csrfToken || !tokens.verify(req.cookies.csrfSecret, csrfToken)) {
            // token not provided/invalid token
            res.status(400).send('Missing CSRF Token');
            return;
        }

        // get email and pass from request body, call user service method to check if the credentials are correct
        const { email, password } = req.body;
        const user = await userService.getUserWithCredentials(email, password);

        if (!user) {
            // render login page with error message in template
            // prevents enumeration attacks with consistent messaging
            res.render('login', { error: 'Please check your credentials.' });
            return;
        }

        // login correct, give authToken cookie and redirect to dashboard route
        // http only so auth token can't be taken from document.cookie
        res.cookie('authToken', user.token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
            .redirect(303, '/dashboard');
    });

app.route('/dashboard')
    .get((req, res) => {
        if (!userService.loggedIn(req, res)) {
            res.render('login');
            return;
        }

        // render dash board page, render template with email in template
        res.render('dashboard', { email: res.locals.user });
    });

app.route('/details')
    .get((req, res) => {
        if (!userService.loggedIn(req, res)) {
            res.render('login');
            return;
        }

        // get account number, email, balance from res.locals and send it to be rendered in the details template
        res.render('details', 
            {
                accountNumber: res.locals.id, 
                user: res.locals.user, 
                balance: accountService.getBalance(res.locals.id, res.locals.user) 
            });
    });

app.route('/transfer')
    .get((req, res) => {
        if (!userService.loggedIn(req, res)) {
            res.render('login');
            return;
        }

        // render transfer page
        res.render('transfer');
    })
    .post((req, res) => {
        if (!req.body) {
            // somehow someone sends a request without a body (like using .fetch())
            res.status(400).send('Bad Request');
            return;
        }

        if (!userService.loggedIn(req, res)) {
            res.render('login');
            return;
        }

        const csrfToken = req.body.csrfToken; // get the csrf token posted by the form
        if (!csrfToken || !tokens.verify(req.cookies.csrfSecret, csrfToken)) {
            // token not provided/invalid token
            res.status(400).send('Missing CSRF Token');
            return;
        }

        // get the target account numbers and the amount to be transfered from the request body
        // source id is already stored in a cookie, and each user only has 1 account for their email anyways
        const source = res.locals.id; // no need to get source (session user) id from request, already in cookie
        const target = req.body.to;
        const amount = parseInt(req.body.amount);

        console.log(source)

        // edge case handling for invalid amount input
        // validate amount
        if (amount < 0) {
            res.status(400).send('You can\'t transfer negative amounts');
            return;
        }
        else if (amount > 1000) {
            res.status(400).send('Transfer amount is too large');
            return;
        }
        else if (isNaN(amount)) {
            res.status(400).send('Please input a valid amount');
            return;
        }

        // get balance of source account, check if the account exists & if they have enough in their balance for transfer
        const availableBalance = accountService.getBalance(source, res.locals.user);

        // source account balance validation
        if (availableBalance === undefined) {
            res.status(404).send('Account not found');
            return;
        }
        else if (amount > availableBalance) {
            res.status(400).send('Source account has insufficient balance');
            return;
        }
        else if (isNaN(availableBalance)) {
            res.status(400).send('Something is wrong with the source account, try a different one');
            return;
        }

        // call transfer method and handle errors by returning error status and sending error page
        if (accountService.doTransfer(source, target, amount)) {
        }
        else {
            res.status(500).send('Something went wrong. Please try again later.');
            return;
        }

        // after successful transfer, redireect to dashboard route
        res.redirect(303, 'dashboard');
    });

app.route('/logout')
    .get((req, res) => {
        // on logout, clear all auth/csrf cookies and redirect to dashboard route
        res.clearCookie('authToken')
            .clearCookie('csrfSecret')
            .clearCookie('csrfToken')
            .redirect(303, '/dashboard')
    });

app.route('/createaccount')
    .get((req, res) => {
        if (!userService.loggedIn(req, res)) {
            res.render('createaccount');
            return;
        }

        res.redirect(303, '/dashboard');
    })
    .post(async (req, res) => {
        if (!req.body) {
            // somehow someone sends a request without a body (like using .fetch())
            res.status(400).send('Bad Request');
            return;
        }

        if (userService.loggedIn(req, res)) {
            res.redirect(303, '/dashboard');
            return;
        }
        
        const csrfToken = req.body.csrfToken; // get the csrf token posted by the form
        if (!csrfToken || !tokens.verify(req.cookies.csrfSecret, csrfToken)) {
            // token not provided/invalid token
            res.status(400).send('Missing CSRF Token');
            return;
        }

        // get fields from post request
        const { password, firstName, lastName} = req.body;
        const email = req.body.email.toLowerCase();

        // verify email, pass, and name fields
        const nameErr = verifyName(firstName) || verifyName(lastName);
        const emailErr = !verifyEmail(email) ? 'Invalid email format' : undefined;
        const passErr = verifyPassword(password);
        
        const inputErr = nameErr || emailErr || passErr; // get the error so it can be rendered on the template

        if (inputErr) {
            res.status(400).render('createaccount', { error: inputErr });
            return;
        }

        const uid = userService.getAccountNumber(email);

        if (uid) {
            // render create account page with error message in template
            res.status(400).render('createaccount', { error: 'Unable to create account. Please check your credentials.' });
            return;
        }

        const finalName = `${firstName} ${lastName}`;

        if (userService.createAccount(email, password, finalName)) {
            res.render('login', { success: 'Account created successfully.' });
        }
        else {
            res.status(500).render('createaccount', { error: 'Something went wrong, try again later.' });
        }
    });


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});