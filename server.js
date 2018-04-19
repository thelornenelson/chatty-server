const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;
const uuidv4 = require('uuid/v4');

// set port to 3001
const PORT = 3001;

const userColorsCount = 5;

// create express server
const server = express()
  // server static assets
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// create websockets server
const wss = new SocketServer({ server });

const generateColorId = function(){
  // return Math.floor((Math.random() * userColorsCount));

  return wss.clients.size % userColorsCount;
};

// Broadcast to all connected clients. Converts data parameter to JSON before sending.
wss.broadcast = function broadcast(data) {

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

};

wss.broadcastUserChange = function(){

  wss.broadcast({
    id: uuidv4(),
    type: "incomingNotification",
    userCount: wss.clients.size
  });

}

wss.on('connection', (ws) => {

  // add new property with colorId for this client
  ws.myDetails = { colorId: generateColorId() };

  console.log(`Client Connected, assigned colorId ${ ws.myDetails.colorId }`);

  wss.broadcastUserChange()

  ws.on('message', function incoming(data) {
    const parsedData = JSON.parse(data)

    let newMessage;

    if(parsedData.type === "postNotification"){
      newMessage = {
        id: uuidv4(),
        type: "incomingNotification",
        content: `${parsedData.oldUsername} has changed their name to ${parsedData.username}`
      };

      console.log(`${parsedData.oldUsername} has changed their name to ${parsedData.username}`);

    } else {

      newMessage = {
        id: uuidv4(),
        type: "incomingMessage",
        content: parsedData.content,
        username: parsedData.username,
        colorId: ws.myDetails.colorId
      };

      console.log(`${ newMessage.id }: User ${newMessage.username} says ${newMessage.content}`);

    }

    wss.broadcast(newMessage);

  });

  ws.on('close', (closeEvent) => {
    console.log('Client Disconnected');
    wss.broadcastUserChange()
  });

});
