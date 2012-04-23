// depends on config.js

var lastTimestamp = 0;
var HISTORY_SCROLL_THRESHOLD = 200;
var loading = false;

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

function addMessages(messages, clear) {
  if (clear) {
    resetDisplayArea();
  }
  for (i = 0; i < messages.length; ++i) {
    displayMessage(messages[i], false, true);
    lastTimestamp = messages[i].ts;
  }
  if (messages.length == 0) {
    if ($('#no_more_items').length == 0) {
      div = $('<div>');
	  div.attr('id', 'no_more_items');
	  div.html('No more messages to load');
      $('#messagebox .scrollr').append(div);
    }
  } else {
    $('#no_more_items').remove();
  }
  loading = false;
}


function getHistory(date) {
  var timestamp = date.getTime();
  loading = true;
  $.ajax({
    url: "/getMessages/"+timestamp,
    type: "POST",
    success: function(messages) {
      addMessages(messages, true);
    },
    error: function() {
      loading = false;
    },
  });
}

function resetDisplayArea() {
  $("#messagebox .scrollr").empty();
  lastMessage = { user: NO_USER };
}

function loadMore() {
  loading = true;
  $.ajax({
    url: "/getMessages/"+lastTimestamp,
    type: "POST",
    success: function(messages) {
      addMessages(messages, false);
    },
    error: function() {
      loading = false;
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
    if (elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight() + HISTORY_SCROLL_THRESHOLD) {
      if (!loading) {
        loadMore();
      }
    }
  });

  var today = new Date();
  getHistory(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
});
