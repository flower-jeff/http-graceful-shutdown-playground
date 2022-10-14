import http from 'http';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/unhandledRejection', (req, res) => {
    Promise.reject('rejected');
    res.send('i failed');
});

app.get('/uncaughtException', (req, res) => {
    // This won't trigger the terminus handler b/c of express
    // throw new Error('error');
    // See here: https://expressjs.com/en/guide/error-handling.html
    // But this will
    setTimeout( () => {throw new Error('error')}, 1000);
});

const server = http.createServer(app);

/*********** http-graceful-shutdown setup *********/


/*********** End setup ****************************/

server.listen(3000);
