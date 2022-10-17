import http from 'http';
import express from 'express';
import gracefulShutdown from 'http-graceful-shutdown';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/unhandledRejection', (req, res) => {
    // The signal passed to preShutdown and onShutdown is the contents of the rejected promise below and not the name of the exception
    // Could be helpful if we throw an actual error but may be too specific to help with logging
    Promise.reject('blahblooblahy');
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

// Notes
// No dependency on stoppable
// Unlike terminus, this package doesn't allow you to define additional endpoints
// Package is straightforward to use but doesn't help with k8s probes
// No way to reference shutdown state of server when responding to healthcheck for instance

const shutdownOptions = {
    preShutdown: async (signal) => {console.log(`preShutdown with signal: ${signal}`)},
    onShutdown: async (signal) => {console.log(`About to shutdown with signal: ${signal}`)},
    // finally runs at end of shutdown but does not receive signal
    // finally: () => {console.log('finally)},
    // 30000ms is default
    // we can sync this with our k8s shutdown param
    timeout: 30000,
    // This is weird, takes space separated string of signals
    signals: 'SIGINT unhandledRejection'
};

gracefulShutdown(server, shutdownOptions);

/*********** End setup ****************************/

server.listen(3000);
