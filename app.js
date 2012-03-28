var express = require('express'),
    everyauth = require('everyauth'),
    util = require('util'),
    persistency = require('./persistency'),
    config = require('./config'),
    route = require('./route'),
    MongoStore = require('connect-mongo'),
    sessionStore = new MongoStore({
      db: config.mongo.db,
      clear_interval: 60 * 30 // clear expired sessions from mongo each 30 min
    }),
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
          if (isFirstTimeUser) {
            realtime.pushSystemMessage('FFC125', savedUser.name + ' is requesting permission to join the group chat. Use the whitelist page to grant of revoke permission.')
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
    cookie: {maxAge: 60000 * 30}, // 30 min session timeout
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

realtime.init(app, sessionStore);
persistency.init();
route.addRoutes(app);
route.setRealtimeEngine(realtime);

app.listen(config.server.port);
