var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
var sharedb = require('sharedb-mongo')('mongodb://localhost:27017/test');
var uuid = require('uuid');
const path = require('path');
var debug = require('debug')('servercode');

ShareDB.types.register(richText.type);
var backend = new ShareDB({ 'db': sharedb });
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('examples', 'richtext');
  doc.fetch(function (err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([{ insert: 'Hi!' }], 'rich-text', callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();

  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({ server: server });
  wss.on('connection', function (ws, req) {
    // generate an id for the socket
    ws.id = uuid();
    ws.isAlive = true;

    debug('A new client (%s) connected.', ws.id);

    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);

    ws.on('pong', function (data, flags) {
      debug('Pong received. (%s)', ws.id);
      ws.isAlive = true;
    });

    ws.on('error', function (error) {
      debug('Client connection errored (%s). (Error: %s)', ws.id, error);
    });
  });


  server.listen(5000);
  console.log('Listening on http://localhost:5000');
}


/***********************************/
// const path = require('path');
// const express = require('express');
// const app = express();

// // Serve static files
// app.use(express.static(__dirname + '/dist/sharedbAngular'));

// // Send all requests to index.html
// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname + '/dist/sharedbAngular/index.html'));
// });

// // default Heroku port
// app.listen(process.env.PORT || 5000);