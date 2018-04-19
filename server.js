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

// generates number from 0 to userColorsCount - 1. Current implementation assigns colors sequentially on connect, but could easily be expanded to pick color based on username, alphabetical, random, etc.
const generateColorId = function(){
  return wss.nextAnonymous % userColorsCount;
};

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

      ws.myDetails.username = parsedData.username;

      newMessage = {
        id: uuidv4(),
        type: "incomingNotification",
        content: `${parsedData.oldUsername} has changed their name to ${parsedData.username}`
      };

      console.log(`${parsedData.oldUsername} has changed their name to ${parsedData.username}`);

    } else if(parsedData.type === "postGenerateUsername"){

      ws.myDetails.username = wss.generateNextUsername();

      newUsername = {
        id: uuidv4(),
        type: "incomingGenerateUsername",
        content: ws.myDetails.username
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(newUsername));
      }

      newMessage = {
        id: uuidv4(),
        type: "incomingNotification",
        content: `${ws.myDetails.username} has joined. Say hi!`
      };

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

    }

    // broadcast newMessage, however it's been defined.
    wss.broadcast(newMessage);

  });

  ws.on('close', (closeEvent) => {
    console.log(`${ws.myDetails.username} disconnected`);

    // someone has disconnected, so rebroadcast current count of connected users.
    wss.broadcastUserChange()

    const newMessage = {
            id: uuidv4(),
            type: "incomingNotification",
            content: `${ws.myDetails.username} has left.`
          };

    // broadcast user left message
    wss.broadcast(newMessage);

  });

});
