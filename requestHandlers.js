var persistency = require('./persistency'),
    date_utils = require('date-utils'),
    everyauth = require('everyauth'),
    config = require('./config'),
    util = require('util');

var realtime;


function setRealtimeEngine(engine) {
  realtime = engine;
}

function isUserAllowed(req, res, success) {
  if (!req.loggedIn) {
    res.redirect('/login'); 
  } else {
    persistency.isUserWhitelisted(req.session.auth.google.user.id, function(whitelisted) {
      if (whitelisted) success();
      else res.redirect('/access');
    });
  }
}

function login(req, res) {
  res.render('login');
}

function index(req, res) {
  isUserAllowed(req, res, function() {
    res.render('index', {
      calendar_web_link: config.app.calendar
    });
  });
}

function history(req, res) {
  isUserAllowed(req, res, function() {
    res.render('history', {endpoint: '/getMessages/'});
  });
}

function memegeist(req, res) {
  isUserAllowed(req, res, function() {
    res.render('memegeist', {endpoint: '/getMemes/'});
  });
}

function topMessages(req, res) {
  isUserAllowed(req, res, function() {
    res.render('history', {endpoint: '/getTopMessages/'});
  });
}

function getMessages(req, res) {
  timestamp = parseInt(req.params.timestamp);
  if (isNaN(timestamp)) {
    res.render('404');
  } else {
    persistency.getMessagesChunk(timestamp, 100, function(err, messages) {
      persistency.mergeMessagesWithUsers(messages, null, function(messages) {
        res.contentType('json');
        res.send(messages);
      });
    });
  }
}

function getTopMessages(req, res) {
  var beginTimestamp = new Date()
  beginTimestamp.setTime(parseInt(req.params.timestamp));
  var endTimestamp = new Date()
  if (isNaN(beginTimestamp)) {
    res.render('404');
  } else {
    persistency.getMessages(beginTimestamp, endTimestamp, function(err, messages) {
      persistency.mergeMessagesWithUsers(messages, null, function(messages) {
        //Sorts descendingly by the number of upvotes
        messages.sort(function(firstMessage, secondMessage) {
          firstVoteCount = 0
          if (firstMessage.uptokes !== undefined)
            firstVoteCount = firstMessage.uptokes - firstMessage.downtokes
          secondVoteCount = 0
          if (secondMessage.uptokes !== undefined)
            secondVoteCount = secondMessage.uptokes - secondMessage.downtokes
          return secondVoteCount - firstVoteCount
        });
        res.contentType('json');
        res.send(messages);
      });
    });
  }
}

function getMemes(req, res) {
  timestamp = parseInt(req.params.timestamp);
  if (isNaN(timestamp)) {
    res.render('404');
  } else {
    persistency.getMemesChunk(timestamp, 100, function(err, messages) {
      persistency.mergeMessagesWithUsers(messages, null, function(messages) {
        res.contentType('json');
        res.send(messages);
      });
    });
  }
}

function loadMemes(req, res) {
  isUserAllowed(req, res, function() {
    persistency.getMemes(function(error, memes) {
      if (error) {
        res.statusCode = 500;
        res.end('Error loading memes');
        return;
      }
      res.contentType('json');
      res.send(memes);
    });
  });
}

function beta(req, res) {
  isUserAllowed(req, res, function() {
    res.render('beta', {
      calendar_web_link: config.app.calendar
    });
  });
}

function whitelist(req, res) {
  isUserAllowed(req, res, function() {
    persistency.getUsers(function(err, users) {
      if (err) handleError(err);
      else {
        pending = [];
        accepted = [];
        banned = [];
        userMap = {};
        // exclude system user
        users = users.filter(function(user) {
          return user.id !== 'ServusTalk';
        });
        for (i in users) {
          if (users[i].acceptedBy && users[i].bannedBy) {
	    // TODO this will happen for first person to login after everyone has been blacklisted
            console.error('User ' + users[i].email + ' cannot be both banned and accepted at the same time');
          }
          if (users[i].acceptedBy) accepted.push(users[i]);
          else if (users[i].bannedBy) banned.push(users[i]);
          else pending.push(users[i]);
          userMap[users[i].id] = users[i];
        }
        res.render('whitelist', {
          accepted: accepted,
          pending: pending,
          banned: banned,
          userMap: userMap
        });
      }
    });
  });
}

function handleError(err) {
  console.warn('Error getting messages: ' + err, err.stack);
  res.render('404');
}

function acceptUser(req, res) {
  isUserAllowed(req, res, function() {
    userId = req.params.userid;
    persistency.getUser(userId, function(err, user) {
      if (err) handleError(err);
      else {
        if (!user.acceptedBy) {
          delete user.bannedBy;
          user.acceptedBy = req.session.auth.google.user.id;
          persistency.updateUser(user);
          if (realtime) {
            realtime.pushSystemMessage('99CC32', user.name + ' has been whitelisted by ' + req.session.auth.google.user.name);
          }
        }
        res.redirect('/whitelist');
      }
    });
  });
}

function banUser(req, res) {
  isUserAllowed(req, res, function() {
    userId = req.params.userid;
    persistency.getUser(userId, function(err, user) {
      if (err) handleError(err);
      else {
        if (!user.bannedBy) {
          delete user.acceptedBy;
          user.bannedBy = req.session.auth.google.user.id;
          persistency.updateUser(user);
          if (realtime) {
            realtime.disconnectUser(userId);
            realtime.pushSystemMessage('FF6A6A', user.name + ' has been blacklisted by ' + req.session.auth.google.user.name);
          }
        }
        res.redirect('/whitelist');
      }
    });
  });
}

function access(req, res) {
  if (!req.loggedIn) {
    res.redirect('/login');
  } else {
    persistency.isUserWhitelisted(req.session.auth.google.user.id, function(whitelisted) {
      if (whitelisted) {
        res.redirect('/');
      } else {
        res.render('access');
      }
    });
  }

}

function pay(req, res) {
  isUserAllowed(req, res, function() {
    res.render('pay');
  });
}

function vote(req, res) {
  user_id = req.session.auth.google.user.id;
  if (req.body.vote === undefined || req.body.message_ts === undefined ||
      !(req.body.vote <= 1 && req.body.vote >= -1)) {
    res.statusCode = 400;
    res.end('Invalid request');
    return;
  }

  message_ts = parseInt(req.body.message_ts);
  vote = parseInt(req.body.vote);
  persistency.saveVote(message_ts, user_id, vote, function(message) {
    realtime.broadcast('vote', message);
  });
  res.end('uptokes!');
}

function map(req, res) {
  isUserAllowed(req, res, function() {
    res.render('map');
  });
}

function distinctCheckins(req, res) {
  isUserAllowed(req, res, function() {
    persistency.getDistinctCheckins(function(error, checkins) {
      if (error) {
        res.statusCode = 500;
        res.end('Error retrieving checkins');
        return;
      }
      IGNORE_LOCATIONS = {'null': true, '127.0.0.1': true};
      locations = {};
      for(i in checkins) {
        location = checkins[i].text.location;
        lat = checkins[i].text.lat;
        lng = checkins[i].text.lng;
        if (!IGNORE_LOCATIONS[location]) {
          if (locations[location]) {
            locations[location]['count']++;
          } else {
            locations[location] = {};
            locations[location]['count'] = 1;
            locations[location]['lat'] = lat;
            locations[location]['lng'] = lng;
          }
        }
      }
      res.contentType('json');
      res.send(locations);
    });
  });
}

exports.index = index
exports.login = login
exports.access = access
exports.history = history
exports.memegeist = memegeist
exports.topMessages = topMessages
exports.beta = beta
exports.whitelist = whitelist
exports.acceptUser = acceptUser
exports.banUser = banUser
exports.setRealtimeEngine = setRealtimeEngine
exports.pay = pay
exports.vote = vote
exports.getMessages = getMessages
exports.getTopMessages = getTopMessages
exports.getMemes = getMemes
exports.loadMemes = loadMemes
exports.map = map
exports.distinctCheckins = distinctCheckins
