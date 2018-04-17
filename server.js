const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;
const uuidv4 = require('uuid/v4');

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

  // Broadcast to all connected clients. Converts data parameter to JSON before sending.
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  ws.on('message', function incoming(data) {

    const parsedData = JSON.parse(data)

    const newMessage = {
        id: uuidv4(),
        type: "incomingMessage",
        content: parsedData.content,
        username: parsedData.username
    };

    console.log(`${ newMessage.id }: User ${newMessage.username} says ${newMessage.content}`);

    wss.broadcast(newMessage);

  });

  ws.on('close', () => console.log('Client Disconnected'));

});
