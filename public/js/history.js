// depends on config.js

var lastTimestamp = 0;

function mergeMessagesWithUsers(messages, users) {
  // Maps user_id -> user
  users_by_id = {};
  for (idx in users) {
    users_by_id[users[idx].id] = users[idx];
  }

  // message.user contains id, but we need a user object
  for (idx in messages) {
    messages[idx].user = users_by_id[messages[idx].user];
  }
}


function getHistory(date) {
  var timestamp = date.getTime();
  $.ajax({
    url: "/getMessages/"+timestamp,
    type: "POST",
    success: function(messages) {
      console.log(messages);
      resetDisplayArea();
      for (i = 0; i < messages.length; ++i) {
        displayMessage(messages[i], false, true);
        lastTimestamp = messages[i].ts;
      }
    },
  });
}

function resetDisplayArea() {
  $("#messagebox .scrollr").empty();
  lastMessage = { user: NO_USER };
}

function loadMore() {
  $.ajax({
    url: "/getMessages/"+lastTimestamp,
    type: "POST",
    success: function(messages) {
      for (i = 0; i < messages.length; ++i) {
        displayMessage(messages[i], false, true);
        lastTimestamp = messages[i].ts;
      }
    },
  });
}

$(document).ready(function() {
  $.SyntaxHighlighter.init({
    'lineNumbers': true,
    'baseUrl' : 'public/syntaxhighlighter',
    'themes' : ['ubutalk'],
    'theme': 'ubutalk'
  });

  $("#datepicker").datepicker({
    onSelect: function(dateText, inst) {
      date = new Date(inst.currentYear, inst.currentMonth, inst.currentDay, 0, 0, 0, 0);
      getHistory(date);
    }
  });

  $('.scrollr').scroll(function(){
    var elem = $('#messagebox .scrollr');
    if (elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight() + 100) {
      loadMore();
    }
  });

  var today = new Date();
  getHistory(new Date(today.getYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
});
