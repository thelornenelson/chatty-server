const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;
const uuidv4 = require('uuid/v4');

// set port to 3001
const PORT = 3001;

// set this to match the number of colors defined in css
const userColorsCount = 5;

// create express server
const server = express()
  // server static assets
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// create websockets server
const wss = new SocketServer({ server });



// generates number from 0 to userColorsCount - 1. Current implementation assigns colors sequentially on connect, but could easily be expanded to pick color based on username, alphabetical, random, etc.
const generateColorId = function(){
  return wss.clients.size % userColorsCount;
};

// Broadcast data to all connected clients. Converts data parameter to JSON before sending.
wss.broadcast = function broadcast(data) {

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

};

// broadcasts message with count of currently connected users
wss.broadcastUserChange = function(){

  wss.broadcast({
    id: uuidv4(),
    type: "incomingNotification",
    userCount: wss.clients.size
  });

}

// used to generate distinct anonymous names
wss.nextAnonymous = 0;

wss.generateNextUsername = function(){

  wss.nextAnonymous++;
  // return Anonymous, Anonymous1, Anonymous2, etc...
  return `Anonymous${(wss.nextAnonymous - 1) || ""}`;

}

wss.on('connection', (ws) => {

  // add new property with colorId to this client
  ws.myDetails = { colorId: generateColorId() };

  console.log(`Client Connected, assigned colorId ${ ws.myDetails.colorId }`);

  // someone has just connected, so broadcast the current count of connected users
  wss.broadcastUserChange()

  ws.on('message', function incoming(data) {

    const parsedData = JSON.parse(data)
    let newMessage;

    if(parsedData.type === "postNotification"){
      // notification, at this point will be a user name change.

      newMessage = {
        id: uuidv4(),
        type: "incomingNotification",
        content: `${parsedData.oldUsername} has changed their name to ${parsedData.username}`
      };

      console.log(`${parsedData.oldUsername} has changed their name to ${parsedData.username}`);

      wss.broadcast(newMessage);

    } else if(parsedData.type === "postGenerateUsername"){

      newMessage = {
        id: uuidv4(),
        type: "incomingGenerateUsername",
        content: wss.generateNextUsername()
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(newMessage));
      }

    } else {
      // otherwise a client has sent a new message. Build message by adding id, colorId
      newMessage = {
        id: uuidv4(),
        type: "incomingMessage",
        content: parsedData.content,
        username: parsedData.username,
        colorId: ws.myDetails.colorId
      };

      console.log(`${ newMessage.id }: User ${newMessage.username} says ${newMessage.content}`);

      wss.broadcast(newMessage);


    }



  });

  ws.on('close', (closeEvent) => {
    console.log('Client Disconnected');

    // someone has disconnected, so rebroadcast current count of connected users.
    wss.broadcastUserChange()
  });

});
