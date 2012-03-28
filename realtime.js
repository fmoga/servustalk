var io = require('socket.io'),
    express = require('express'),
    config = require('./config'),
    persistency = require('./persistency'),
    parseCookie = require('connect').utils.parseCookie;

var online = {};
var history = [];
var title = config.defaultTitle;
var PING_INTERVAL = 5 * 60 * 1000; // 5 min
var MAX_LATENCY = 10 * 1000; // 10 sec

setInterval(function() {
  broadcast('ping');
}, PING_INTERVAL);

function broadcast(type, body) {
  var buddyListUpdate = false;
  var now = new Date().getTime();
  for (id in online) {
    if (online[id].disconnected || now - online[id].lastPong > PING_INTERVAL + MAX_LATENCY) {
      online[id].disconnect();
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
    persistency.getTitle(function(err, titles) {
        if (err) {
            console.warn('Error getting title: ' + err, err.stack);
        } else {
            if (titles.length == 0) {
                title = config.defaultTitle;
            } else {
                title = titles[0];
            }
        }
    });

    persistency.getHistory(config.app.history_size, function(err, messages) {
        if (err) {
            console.warn('Error getting history: ' + err, err.stack);
        } else {
            persistency.mergeMessagesWithUsers(messages, null, function(messages) {
              history = messages.reverse();
            });
        }
    });

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
      if (socket.handshake.session.loggedUser) {
        socket.user = socket.handshake.session.loggedUser;
        socket.user.idle = false;
        online[socket.id] = socket;
        broadcast('clients', packClients());
        socket.emit('history', history);
        socket.lastPong = new Date().getTime();
        socket.emit('ping');

        socket.on('pong', function() {
          socket.lastPong = new Date().getTime();
        });

        socket.on('message', function(message) {
          var completeMessage = {
            user: socket.user,
            text: message,
            ts: new Date().getTime(),
          }
          history.push(completeMessage);
          persistency.saveMessage(completeMessage);
          if (history.length > config.app.history_size) history.shift();
          broadcast('message', completeMessage);
        });

        socket.on('disconnect', function() {
          delete online[socket.id];
          broadcast('clients', packClients());
        });

        socket.on('loadTitle', function() {
            socket.emit('loadTitle', title); 
        });

        socket.on('updateTitle', function(newTitle) { 
            title = {
              text: newTitle,
              user: socket.user.name,
              ts: new Date().getTime()
            };
            broadcast('updateTitle', title);

            title.user = socket.user.id;
            persistency.saveTitle(title);
        });

        socket.on('idle', function() {
          socket.user.idle = true;
          broadcast('clients', packClients());
        });

        socket.on('not idle', function() {
          socket.user.idle = false;
          broadcast('clients', packClients());
        });
      } else {
        socket.disconnect();
      }
    });

}

exports.init = init
