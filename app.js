var express = require('express'),
    i18n = require("i18n"),
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
          if (isFirstTimeUser && count > 0) {
            realtime.pushSystemMessage('FFC125', savedUser.name + ' (' + savedUser.email + ') is requesting permission to join the group chat. Use the whitelist page to grant of revoke permission.')
          }
        }
      });
    });
    return promise;
  })
  .redirectPath('/');

i18n.configure({
  locales: config.app.supported_languages
});
i18n.setLocale(config.app.language);

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
  app.use(i18n.init);
  app.helpers({
    __i: i18n.__,
    __n: i18n.__n
  });
});

everyauth.helpExpress(app);

realtime.init(app, sessionStore);
persistency.init();
route.addRoutes(app);
route.setRealtimeEngine(realtime);

app.listen(config.server.port);
