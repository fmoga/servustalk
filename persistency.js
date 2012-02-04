var Mongolian = require("mongolian")

var server = new Mongolian

var db = server.db("ubuntalk")

var messages = db.collection("messages")

exports.saveMessage = function(message) {
    msg = {
        user: message.user.id,
        text: message.message,
        ts: message.ts
    }
    messages.insert(msg);
}

exports.getMessages = function(callback) {
    return messages.find().toArray(callback);
}
