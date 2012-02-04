var io = require('socket.io'),
    express = require('express'),
    config = require('./config'),
    persistency = require('./persistency'),
    parseCookie = require('connect').utils.parseCookie;

var online = {};
var history = [];

function broadcast(type, body) {
  var buddyListUpdate = false;
  for (id in online) {
    if (online[id].disconnected) {
      delete online[id]; 
      buddyListUpdate = true;
    } else {
      online[id].emit(type, body);
    }
  }
  if (buddyListUpdate) {
    broadcast('clients', packClients());
  }
}

function packClients() {
  clients = [];
  for (id in online) {
    clients.push(online[id].user);
  }
  return clients;
}

function init(app, sessionStore) {
    var sio = io.listen(app);
    sio.configure(function(){
      sio.set('log level', config.app.sio.log_level);
      sio.set('transports', config.app.sio.transports);
    });


    // customize authorization to transmit express session to socket.io via handshake data
    sio.set('authorization', function (data, accept) {
      if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        // (literally) get the session data from the session store
        sessionStore.get(data.sessionID, function (err, session) {
          if (err || !session) {
            // if we cannot grab a session, turn down the connection
            accept('Error', false);
          } else {
            // save the session data and accept the connection
            data.session = session;
            accept(null, true);
          }
        });
      } else {
        return accept('No cookie transmitted.', false);
      }
    });

    sio.sockets.on('connection', function(socket) {
      if (socket.handshake.session.auth) {
        socket.user = socket.handshake.session.auth.google.user;
        online[socket.id] = socket;
        console.log('Connected: ' + socket.user.name);
        broadcast('clients', packClients());
        socket.emit('history', history);

        socket.on('message', function(message) {
          var completeMessage = {
            user: socket.user,
            message: message,
            ts: new Date().getTime(),
          }
          history.push(completeMessage);
          persistency.saveMessage(completeMessage);
          if (history.length > config.app.history_size) history.shift();
          broadcast('message', completeMessage);
        });

        socket.on('disconnect', function() {
          delete online[socket.id];
          console.log('Disconnected: ' + socket.user.name);
          broadcast('clients', packClients());
        });
      } else {
        socket.disconnect();
      }
    });


}

exports.init = init
