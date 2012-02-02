var express = require('express'),
    everyauth = require('everyauth'),
    util = require('util'),
    io = require('socket.io'),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    parseCookie = require('connect').utils.parseCookie,
    persistency = require('./persistency');

everyauth.google
  .appId('596685303616.apps.googleusercontent.com')
  .appSecret('jzmnVYcNNZBAcVjjDe0T-q8k')
  .scope('https://www.googleapis.com/auth/userinfo.profile')
  .moduleTimeout(-1)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
      console.log('Fetched from Google: ' + util.inspect(googleUserMetadata));
      return googleUserMetadata;
  })
  .redirectPath('/');

var app = express.createServer();
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: "wqeifujasldkjvas",
    key: 'express.sid'
  }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.set('view engine', 'jade');
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.errorHandler());
});

everyauth.helpExpress(app);

app.get('/', function(req, res) {
  res.render('layout');
});

app.listen(80);

var sio = io.listen(app);
sio.configure(function(){
  sio.set('log level', 1);
  sio.set('transports', ['xhr-polling', 'jsonp-polling']);
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

var online = {};
var history = [];
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
      if (history.length > 20) history.shift();
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
