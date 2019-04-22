var express = require('express');
var url = require('url');

var app = express();
var server = require('http').Server(app);

// init websockets servers
var backend = require('./sharedb-server');
var wssShareDB = require('./wss-sharedb')(server);
var wssCursors = require('./wss-cursors')(server);

//createDoc(startServer);
startServer();
// function createDoc(callback) {
//   var connection = backend.connect();
//   var doc = connection.get('documents', 'richtext');
//   doc.fetch(function (err) {
//     if (err) throw err;
//     if (doc.type === null) {
//       doc.create([{ insert: 'Hi!' }], 'rich-text', callback);
//       return;
//     }
//     callback();
//   });
// }

function startServer() {
  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
  
    if (pathname === '/sharedb') {
      wssShareDB.handleUpgrade(request, socket, head, (ws) => {
        wssShareDB.emit('connection', ws);
      });
    } else if (pathname === '/cursors') {
      wssCursors.handleUpgrade(request, socket, head, (ws) => {
        wssCursors.emit('connection', ws);
      });
    } else {
      socket.destroy();
    }
  });
  
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  server.listen(5000);
  console.log('Listening on http://localhost:5000');
  //module.exports = { app: app, server: server };
  
}
