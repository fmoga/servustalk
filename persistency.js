var Mongolian = require("mongolian"),
    jQuery = require('jquery');

var server = new Mongolian

var db = server.db("ubuntalk")

var messages = db.collection("messages")
var users = db.collection("users")

exports.init = function() {
    users.ensureIndex({id: 1});
}

exports.saveMessage = function(message) {
    msg = {
        user: message.user.id,
        text: message.text,
        ts: message.ts
    }
    messages.insert(msg);
}

exports.getMessages = function(callback) {
    messages.find().toArray(callback);
}

exports.updateUser = function(user) {
    users.findOne({id: user.id}, function(err, db_user) {
        if (!err) {
            if (db_user === undefined) {
                // First time user, save it
                users.insert(user);
            } else {
                // Update existing user
                jQuery.extend(true, db_user, user);
                users.insert(db_user);
            }
        } else {
            console.warn('Error searching for user: ' + err);
        }
    });
}

exports.getUser = function(id, callback) {
    users.findOne({id: id}, callback);
}

exports.getUsers = function(callback) {
    users.find().toArray(callback);
}
