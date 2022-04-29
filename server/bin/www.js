`use strict`;

const app = require(`../app`);
const debug = require(`debug`)('sequelize-with-express:server');
const fs = require(`fs`);
const http = require(`http`);
const https = require(`https`);
const path = require(`path`);
const sequelize = require(`../db`).sequelize;

const privateKey  = fs.readFileSync(path.join(__dirname, 'privkey.pem'), `utf8`);
const certificate = fs.readFileSync(path.join(__dirname, 'fullchain.pem'), `utf8`);
const credentials = {key: privateKey, cert: certificate};

// Get port from environment and store in Express
const port = normalizePort(process.env.PORT || `80`);
app.set(`port`, port);

// Create HTTP server.
const server = http.createServer(app);

// Listen on provided port, on all network interfaces.
sequelize.sync().then(() => {
    console.log(`Started server at port ${port}`)
    server.listen(port);
    console.log(`Started server at port ${portS}`)
    serverS.listen(portS);
});
server.on(`error`, onError);
server.on(`listening`, onListening);

// Get port from environment and store in Express.
const portS = normalizePort(process.env.PORT_S || `443`);
app.set(`portS`, portS);

// Create HTTPS server.
const serverS = https.createServer(credentials, app);

serverS.on(`error`, onErrorS);
serverS.on(`listening`, onListeningS);

/*
* Normalize a port into a number, string, or false.
* @param val - port number
* */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/*
* Event listener for HTTP server "error" event.
* @param error - error object.
* */
function onError(error) {
    if (error.syscall !== `listen`) {
        throw error;
    }

    const bind = typeof port === `string`
        ? `Pipe ${port}`
        : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case `EACCES`:
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case `EADDRINUSE`:
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/*
* Event listener for HTTP server "listening" event.
*
* */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === `string`
        ? `pipe ${addr}`
        : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}

/*
* Event listener for HTTP server "error" event.
* @param error - error object.
* */
function onErrorS(error) {
    if (error.syscall !== `listen`) {
        throw error;
    }

    const bindS = typeof portS === `string`
        ? `Pipe ${portS}`
        : `Port ${portS}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case `EACCES`:
            console.error(`${bindS} requires elevated privileges`);
            process.exit(1);
            break;
        case `EADDRINUSE`:
            console.error(`${bindS} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/*
* Event listener for HTTPS server "listening" event.
*
* */
function onListeningS() {
    const addrS = serverS.address();
    const bindS = typeof addrS === `string`
        ? `pipe ${addrS}`
        : `port ${addrS.portS}`;
    debug(`Listening on ${bindS}`);
}
