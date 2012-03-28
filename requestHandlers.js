var persistency = require('./persistency'),
    date_utils = require('date-utils'),
    everyauth = require('everyauth'),
    config = require('./config'),
    util = require('util');

function isUserAllowed(req, res) {
  if (!req.loggedIn) {
    res.redirect('/login'); 
    return false;
  }
  if (!req.session.loggedUser.acceptedBy) {
    res.redirect('/access');
    return false;
  }
  return true;
}


function login(req, res) {
  res.render('login');
}

function index(req, res) {
  if (isUserAllowed(req, res)) {
    res.render('index', {
      calendar_web_link: config.calendar.web_link
    });
  }
}

function history(req, res) {
  if (isUserAllowed(req, res)) {
    res.render('history');
  }
}

function getHistory(req, res) {
  if (isUserAllowed(req, res)) {
    year = parseInt(req.params.year);
    month = parseInt(req.params.month);
    day = parseInt(req.params.day);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      res.render('404');
      return;
    }

    if (!Date.validateDay(day, year, month)) {
      res.render('404');
      return;
    }

    lower_date = new Date(year, month, day, 0, 0, 0, 0);
    upper_date = lower_date.clone();
    upper_date.addDays(1);

    data = {};
    persistency.getMessages(lower_date, upper_date, function(err, messages) {
      if (err) {
        console.warn('Error getting messages: ' + err, err.stack);
        res.render('404');
      } else {
        persistency.getUsers(function(err, users) {
          if (err) {
            console.warn('Error getting users: ' + err, err.stack);
            res.render('404');
          } else {
            data.messages = messages;
            data.users = users;
            res.contentType('json');
            res.send(data);
          }
        });
      }
    });
  }
}

function beta(req, res) {
  if (isUserAllowed(req, res)) {
    res.render('beta', {
      calendar_web_link: config.calendar.web_link
    });
  }
}

function whitelist(req, res) {
  if (isUserAllowed(req, res)) {
    persistency.getUsers(function(err, users) {
      if (err) handleError(err);
      else {
        pending = [];
        accepted = [];
        banned = [];
        userMap = {};
        for (i in users) {
          if (users[i].acceptedBy && users[i].bannedBy) {
            console.log('User ' + users[i].email + ' cannot be both banned and accepted at the same time');
            res.statusCode = 500;
            res.send('<h1>Error</h1>');
            return;
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
  }
}

function handleError(err) {
  console.warn('Error getting messages: ' + err, err.stack);
  res.render('404');
}

function acceptUser(req, res) {
  if (isUserAllowed(req, res)) {
    userId = req.params.userid;
    persistency.getUser(userId, function(err, user) {
      if (err) handleError(err);
      else {
        if (!user.acceptedBy) {
          delete user.bannedBy;
          user.acceptedBy = req.session.loggedUser.id;
          persistency.updateUser(user);
        }
        res.redirect('/whitelist');
      }
    });
  }
  // TODO send notification to chat
}

function banUser(req, res) {
  if (isUserAllowed(req, res)) {
    userId = req.params.userid;
    persistency.getUser(userId, function(err, user) {
      if (err) handleError(err);
      else {
        if (!user.bannedBy) {
          delete user.acceptedBy;
          user.bannedBy = req.session.loggedUser.id;
          persistency.updateUser(user);
        }
        res.redirect('/whitelist');
      }
    });
  }
  // TODO send notification to chat
}

function access(req, res) {
  if (!req.loggedIn) {
    res.redirect('/login');
    return;
  }
  if (req.session.loggedUser.acceptedBy) {
    res.redirect('/whitelist');
  } else {
    res.render('access');
  }
}

exports.index = index
exports.login = login
exports.access = access
exports.history = history
exports.getHistory = getHistory
exports.beta = beta
exports.whitelist = whitelist
exports.acceptUser = acceptUser
exports.banUser = banUser
