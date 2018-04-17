const express = require('express');
const SocketServer = require('ws').Server;

// set port to 3001
const PORT = 3001;

// create express server
const server = express()
  // server static assets
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// create websockets server
const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client Connected');

  ws.on('message', function incoming(data) {
    const parsedData = JSON.parse(data)
    console.log(`User ${parsedData.username} says ${parsedData.content}`);
  });

  ws.on('close', () => console.log('Client Disconnected'));
});
