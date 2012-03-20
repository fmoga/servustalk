var express = require('express'),
    everyauth = require('everyauth'),
    util = require('util'),
    persistency = require('./persistency'),
    config = require('./config'),
    route = require('./route'),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    realtime = require('./realtime');

everyauth.google
  .appId(config.app.google_client_id)
  .appSecret(config.app.google_client_secret)
  .scope('https://www.googleapis.com/auth/userinfo.profile')
  .moduleTimeout(-1)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
      console.log('Fetched from Google: ' + util.inspect(googleUserMetadata));
      persistency.saveUser(googleUserMetadata);
      return googleUserMetadata;
  })
  .redirectPath('/');

var app = express.createServer();
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: config.app.google_client_secret,
    key: 'express.sid'
  }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/servustalk_favicon.png'));
  app.use(express.errorHandler());
});

everyauth.helpExpress(app);

route.addRoutes(app);
realtime.init(app, sessionStore);
persistency.init();

app.listen(config.server.port);
