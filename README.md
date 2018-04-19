# Chatty
### chatty-app and chatty-server

A real time chat application, using WebSockets and React.

## Features

1. Users are assigned a sequential Anonymous username and color on initial connect.
2. Usernames can be changed and username changes are broadcast to all connected users.
3. Users can send messages which are broadcast to call connected clients.
4. If message contains any image urls, images will be posted in the message feed.
5. Application will display number of currently connected users in the nav bar.
6. Application with indicate when users connect or disconnect from the chat channel.

## Final Product
!["Chat Demo"](https://github.com/thelornenelson/chatty-app/blob/master/docs/chat-demo.png)
!["Image Posting"](https://github.com/thelornenelson/chatty-app/blob/master/docs/chat-demo.png)
!["User Colors Demo"](https://github.com/thelornenelson/chatty-app/blob/master/docs/chat-demo.png)

## Getting Started

You need both the Chatty App and Chatty Server for this project to function.

### Chatty Server
1. Clone the [chatty-server](https://github.com/thelornenelson/chatty-server) repository.
2. Install dependencies using the `npm install` command.
3. Start the server using the `npm start` command. WebSockets will be served from port 3001.
4. Install Chatty App

### Chatty App
1. Clone the [chatty-app](https://github.com/thelornenelson/chatty-app) repository.
2. Install dependencies using the `npm install` command.
3. Run webpack and start the webpack server using the `npm start` command. The app will be served at <http://localhost:3000/>.
4. Go to <http://localhost:3000/> in your browser. Open multiple tabs to add multiple users to the chat room.

## Dependencies

### Chatty App

- react: 15.4.2
- react-dom: 15.4.2
- babel-core: 6.23.1
- babel-loader: 6.3.1
- babel-preset-es2015: 6.22.0
- babel-preset-react: 6.23.0
- babel-preset-stage-0: 6.22.0
- css-loader: 0.26.1
- eslint: 3.15.0
- eslint-plugin-react: 6.9.0
- node-sass: 4.5.0
- sass-loader: 6.0.0
- sockjs-client: ^1.1.2
- style-loader: 0.13.1
- webpack: 2.2.1
- webpack-dev-server: 2.3.0

### Chatty Server

- express: 4.16.3
- nodemon: ^1.17.3
- uuid: ^3.2.1
- ws: 5.1.1
