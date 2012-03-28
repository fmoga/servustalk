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
  .scope('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')
  .moduleTimeout(-1)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
    promise = new this.Promise();
    persistency.getAcceptedUserCount(function(err, count) {
      if (count == 0) {
        // accept first person to login so he can handle user moderation from then on
        console.log('Autoaccepting first logged in user');
        googleUserMetadata.acceptedBy = googleUserMetadata.id;
      }
      persistency.saveUser(googleUserMetadata, function(err, savedUser, isFirstTimeUser) {
        if (err) promise.fail(err);
        else {
          promise.fulfill(savedUser);
          session.loggedUser = savedUser;
          if (isFirstTimeUser) {
            // TODO send group chat message for new user
          }
        }
      });
    });
    return promise;
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
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true })); 
});

everyauth.helpExpress(app);

route.addRoutes(app);
realtime.init(app, sessionStore);
persistency.init();

app.listen(config.server.port);
