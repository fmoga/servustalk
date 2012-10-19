var Mongolian = require("mongolian"),
    jQuery = require('jquery'),
    config = require('./config'),
    util = require('util');

var server = new Mongolian

var db = server.db(config.mongo.db)

var messages = db.collection("messages")
var memes = db.collection("memes")
var users = db.collection("users")
var titles = db.collection("titles")
var message_votes = db.collection("message_votes")

var SERVUSTALK_USER = { // used for system messages
  id: 'ServusTalk',
  name: 'ServusTalk',
  picture: 'http://www.albinoblacksheep.com/download/icon/googletalk.png'
};

function mergeMessagesWithUsers(messages, users, callback) {
  merge = function(messages, users) {
    // Maps user_id -> user
    users_by_id = {};
    for (idx in users) {
      users_by_id[users[idx].id] = users[idx];
    }

    // message.user contains id, but we need a user object
    for (idx in messages) {
      messages[idx].user = users_by_id[messages[idx].user];
    }

    callback(messages); };

  if (users == null) {
    getUsers(function(err, users) {
      if (err) {
        console.warn('Error getting users: ' + err, err.stack);
      } else {
        merge(messages, users);
      }
    });
  } else {
    merge(messages, users);
  }
}

function init() {
  users.ensureIndex({id: 1});
  messages.ensureIndex({ts: 1});
  titles.ensureIndex({ts: 1});
  message_votes.ensureIndex({message_ts: 1, user_id: 1}, {unique: true});
  saveUser(SERVUSTALK_USER, function(err) {
    if (err) {
      console.error('Default ServusTalk system user could not be saved. Check persistency.');
    }
  });
}

function saveMessage(message) {
  msg = {
    user: message.user.id,
    text: message.text,
    type: message.type,
    ts: message.ts
  }
  messages.insert(msg);
}

function saveMeme(meme) {
  memes.insert(meme);
}

function getMemes(callback) {
  memes.find({}, {_id:0}).toArray(callback);
}

function getMessages(lower_date, upper_date, callback) {
  messages.find({ts: { $gt: lower_date.getTime(), $lt: upper_date.getTime()} }, { _id : 0 }).toArray(callback);
}

function getMessagesChunk(timestamp, count, callback) {
  messages.find({ts: {$gt: timestamp} }, {_id : 0 }).limit(count).sort({ts: 1}).toArray(callback);
}

function getDistinctCheckins(callback) {
  messages.find({type : 'CHECKIN'}).toArray(callback);
}

function getMemesChunk(timestamp, count, callback) {
  messages.find({ts: {$gt: timestamp}, text : /^\/meme/}, {_id : 0 }).limit(count).sort({ts: 1}).toArray(callback);
}

function isUserWhitelisted(userId, callback) {
  users.count({id: userId, acceptedBy: {$exists: true}}, function(err, count) {
    if (count > 0) 
      callback(true);
    else 
      callback(false);
  });
}

function updateUser(user, callback) {
  users.update({id: user.id}, user, {safe: true}, callback);
}

function saveUser(user, callback) {
  users.findOne({id: user.id}, {_id : 0}, function(err, db_user) {
    if (!err) {
      if (db_user === undefined) {
        // First time user, save it
        users.insert(user, function(err) {
          if (err) {
            console.warn('Error inserting new user: ' + user.id);
            callback(err);
          } else {
            callback(false, user, true);
          }
        });
      } else {
        // Update existing user
        jQuery.extend(true, db_user, user);
        updateUser(db_user, function(err) {
          if (err) {
            console.warn('Error updating user: ' + db_user.id); 
            callback(err);
          } else {
            callback(false, db_user, false);
          }
        });
      }
    } else {
      console.warn('Error searching for user: ' + err);
    }
  });
}

function getHistory(count, callback) {
  messages.find({}, {_id : 0}).limit(count).sort({ts: -1}).toArray(callback);
}

function getUser(id, callback) {
  users.findOne({id: id}, {_id : 0}, callback);
}

function getUsers(callback) {
  users.find({}, {_id : 0}).toArray(callback);
}

function saveTitle(title) {
  titles.insert(title);
}

function getTitle(callback) {
  titles.find({}, {_id : 0}).sort({ts: -1}).limit(1).toArray(callback);
}

function getAcceptedUserCount(callback) {
  users.count({acceptedBy : {$exists:true}}, callback);
}

function calculateVotes(message, callback) {
  uptokes = 0;
  downtokes = 0;

  message_votes.find({message_ts: message.ts}).forEach(function(message_vote) {
    if (message_vote.vote > 0) {
      ++uptokes;
    }
    if (message_vote.vote < 0) {
      ++downtokes;
    }
  }, function(err) {
    if (!err) {
      message.uptokes = uptokes;
      message.downtokes = downtokes;
      delete message._id;
      messages.update({ts: message.ts}, message, function(err, value) {
        callback(message);
      });
    } else {
      console.warn('Error finding message for saving uptokes.');
    }
  });
}

function saveVote(message_ts, user_id, vote, callback) {
  message_vote = {
    message_ts: message_ts,
    user_id: user_id,
    vote: vote
  };
  messages.findOne({ts: message_ts}, function(err, message) {
    if (message) {
      message_votes.save(message_vote);
      delete message_vote._id
      message_votes.update({message_ts: message_ts, user_id: user_id}, message_vote);
      calculateVotes(message, callback);
    } else {
      console.warn('Invalid message_ts for vote: ' + message_ts);
    }
  });
}

exports.mergeMessagesWithUsers = mergeMessagesWithUsers
exports.init = init
exports.saveMessage = saveMessage
exports.saveMeme = saveMeme
exports.getMessages = getMessages
exports.getMessagesChunk = getMessagesChunk
exports.getMemes = getMemes
exports.getMemesChunk = getMemesChunk
exports.getDistinctCheckins = getDistinctCheckins
exports.saveUser = saveUser
exports.updateUser = updateUser
exports.getHistory = getHistory
exports.getUser = getUser
exports.getUsers = getUsers
exports.saveTitle = saveTitle
exports.getTitle = getTitle
exports.getAcceptedUserCount = getAcceptedUserCount
exports.isUserWhitelisted = isUserWhitelisted
exports.saveVote = saveVote
exports.SERVUSTALK_USER = SERVUSTALK_USER
