// depends on config.js and message.js

var currentClients = [];
var first = true;
var popup;
var focused = true;
var flickeringTitle;
var originalDocTitle;
var roomTitle;
var socket;
var idle = false;
var idlePromise;
var tabHistory;
var unloading = false;

// jQuery plugin to get textarea cursor position
(function ($, undefined) {
  $.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
      pos = el.selectionStart;
    } else if('selection' in document) {
      el.focus();
      var Sel = document.selection.createRange();
      var SelLength = document.selection.createRange().text.length;
      Sel.moveStart('character', -el.value.length);
      pos = Sel.text.length - SelLength;
    }
    return pos;
  }
})(jQuery);

// jQuery plugin to set textarea cursor position
(function ($, undefined) {
  $.fn.selectRange = function(start, end) {
    this.each(function(index, elem) {
      if (elem.setSelectionRange) {
        elem.focus();
        elem.setSelectionRange(start, end);
      } else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    });
    return this;
  }
})(jQuery);

$(document).ready(function() {
  $.SyntaxHighlighter.init({
    'lineNumbers': true,
    'baseUrl' : 'public/syntaxhighlighter',
    'themes' : ['ubutalk'],
    'theme': 'ubutalk'
  });

  loadCalendar(GOOGLE_CALENDAR_ATOM_FEED, 0, GOOGLE_CALENDAR_DAYS_INTERVAL);
  setInterval(function() {
    loadCalendar(GOOGLE_CALENDAR_ATOM_FEED, 0, GOOGLE_CALENDAR_DAYS_INTERVAL);
  }, GOOGLE_CALENDAR_UPDATE_INTERVAL);

  setInterval(function() {
    refreshIdleTimes();
  }, ONE_MINUTE);

  $("a#settingsLink").fancybox();
  $("a#changeTitle").fancybox();

  $("a#changeTitle").click(function() {
    newTitleField = $('#newTitle');
    newTitleField.val(roomTitle.text);
    newTitleField.select();
    newTitleField.focus();
  });

  $('#newTitle').live('keydown', function(e) { 
    var keyCode = e.which; 
    if (keyCode == 13 && !e.shiftKey) { // Enter
      submitTitle();
      return false;
    }
  });

  $("#submitTitle").click(function() {
    submitTitle();
  });

  function submitTitle() {
    var newTitleText = $('#newTitle').val();
    if ($.trim(newTitleText) !== '') { 
      socket.emit('updateTitle', newTitleText);
      $.fancybox.close();
    }
  }

  originalDocTitle = document.title;

  socket = io.connect('/', {
    'force new connection' : true,
    'connect timeout': 5000,
    'try multiple transports': true,
    'reconnect': true,
    'reconnection delay': 1000,
    'max reconnection attempts': 10
  });

  socket.on('connect', function() {
    socket.emit('loadTitle');
  });

  socket.on('reconnect', function(transport, attempts) {
    console.log('DEBUG: reconnect: transport=' + transport + '; attempts=' + attempts);
    reportIdleness();  
  });

  socket.on('reconnecting', function(delay, attempts) {
    console.log('DEBUG: reconnecting: delay=' + delay + '; attempts=' + attempts);
  });

  socket.on('reconnect_failed', function() {
    console.log('DEBUG: reconnect_failed');
  });

  socket.on('ping', function() {
    socket.emit('pong');
  });

  socket.on('loadTitle', function(title) {
    roomTitle = title;
    var result = handleLinksAndEscape(title.text);
    $('#roomTitle').html(result.html);
  });

  socket.on('updateTitle', function(title) {
    roomTitle = title;
    var result = handleLinksAndEscape(title.text);
    $('#roomTitle').html(result.html);
    displayNotification(title.user + ' changed chat title', false, true);
  });

  socket.on('message', function(message) {
    // title flicker
    if (!focused) {
      if (flickeringTitle) clearInterval(flickeringTitle);
      flickeringTitle = setInterval(function(){
        if(document.title === originalDocTitle) {
          document.title = message.user.name + ' has messaged UbunTalk';
	      } else {
          document.title = originalDocTitle;	
        }
      }, FLICKER_TITLE_INTERVAL);
    }
    // desktop notification
    if (!focused && $('#desknot').prop('checked') && window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
      var picture = message.user.picture ? message.user.picture : DEFAULT_PICTURE;
      displayDesktopNotification(picture, message.user.name, message.text);
    }
    displayMessage(message, true, true);
  });

  socket.on('clients', function(clients) {
    var buddylist = $('#buddylist ul');
    $(buddylist).empty();
    var nameStyle = '';
    if ($('#toggle').attr('full') == '0') {
       nameStyle = 'style="display: none"';
    }
    $.each(clients, function(index, client) {
      var picture = client.picture ? client.picture : DEFAULT_PICTURE;
      var idle = client.idle ? 'idle' : '';
      var idleSince = client.idle ? '<span class="idleSince" idleSince="' + (new Date().getTime() - client.idleFor) + '"></span>' : '';
      $(buddylist).append('<li><img class="profilepic ' + idle + ' middle" title="' +client.name + '" src="' + picture + '"/><span class="profilename ' + idle + '" ' + nameStyle + '>' + client.name + '</span>' + idleSince + '</li>'); 
    });

    if (first) {
      first = false;
    } else {
      for (var i = 0; i < currentClients.length; i++) {
        var k = 0;
        while (k < clients.length && currentClients[i].id != clients[k].id) k++;
        if (k == clients.length) {
          displayNotification(currentClients[i].name + ' disconnected', false, true);
        }
      }
      for (var i = 0; i < clients.length; i++) {
        var k = 0;
        while (k < currentClients.length && clients[i].id != currentClients[k].id) k++;
        if (k == currentClients.length) {
          displayNotification(clients[i].name + ' connected', false, true);
        }
      }
    }
    currentClients = clients;
    refreshIdleTimes();
  });

  socket.on('history', function(history) {
    $('#messagebox .scrollr').empty();
    for (index in history) {
      displayMessage(history[index], true, true);
    }
    displayNotification('Fetched latest messages sent to the room', false, true);
    scrollToBottom();
  });

  socket.on('vote', function(message) {
    updateScore(message);
  });

  socket.on('disconnect', function() {
    if (!unloading) {
      var message = 'You have been disconnected from server for maintenance. Please refresh and log in again.';
      displayNotification(message, true, true);
    }
  });

  function displayDesktopNotification(picture, title, text) {
      if (popup) {
        popup.cancel();
      }
      popup = window.webkitNotifications.createNotification(picture, title, text);
      popup.onclick = function() { 
        window.focus(); 
        this.cancel(); 
      };
      popup.show();
  }

  $('#toggle').click(function() {
    if ($(this).attr('full') == '1') {
      $('.profilename').hide();
      $(this).attr('full', '0');
      $(this).html('&laquo;');
      $('#buddylist').css('width', '80px');
    } else {
      $('.profilename').show();
      $(this).attr('full', '1');
      $(this).html('&raquo;');
      $('#buddylist').css('width', '200px');
    }
  });

  $('#inputfield').bind('keydown', function(e) {
  	var input = $('#inputfield'); 
    var keyCode = e.which; 
    if (keyCode == 13 && !e.shiftKey) { // Enter
      var text = $.trim(input.val()); 
      input.val('');
      if (text !== '') {
      	inputHistory.push(text);//add input history
        if (text == '/clear') {
          // handle /clear command
          $('#messagebox .scrollr').html('');
          lastMessage = NO_MESSAGE;
        } else {
          socket.emit('message', text);
        }
      }
      return false;
    }
    else if (keyCode === 38) { // KEY_UP
    	 var newVal = inputHistory.getPrev() || "";
         	 input.val(newVal);
    }
    else if (keyCode === 40) { // KEY_DOWN
    	 var newVal = inputHistory.getNext() || "";
             input.val(newVal);
    }
    else if (keyCode === 9) { // Tab
      e.preventDefault();
      if (tabHistory) {
        showTabResult();
        return false;
      }
      var index = $('#inputfield').getCursorPosition();
      var text = $('#inputfield').val();
      var left = text.substring(0, index);
      var right = text.substring(index);
      index = left.lastIndexOf('@');
      if (index != -1) {
        var mention = left.substring(index + 1);
        left = left.substring(0, index);
        var names = new Array();
        $('.profilename').each(function() {
            var name = $(this).text();
            if ((name).toLowerCase().indexOf(mention.toLowerCase()) == 0) {
              names.push(name);
            }
        }); 
        names = unique(names);
        if (names.length > 0) {
          tabHistory = {
            left: left,
            mention: mention,
            right: right,
            names: names,
            pos: 0
          }
          showTabResult();
        }
      }
    } else {
      tabHistory = null;
    }
  });

  function showTabResult() {
    var name = tabHistory.mention; 
    if (tabHistory.pos < tabHistory.names.length) {
      name = tabHistory.names[tabHistory.pos];
    }
    $('#inputfield').val(tabHistory.left + '@' + name + tabHistory.right);
    var cursor = tabHistory.left.length + 1 + name.length;
    $('#inputfield').selectRange(cursor, cursor);
    if (tabHistory.pos == tabHistory.names.length) {
      tabHistory.pos = 0;
    } else {
      tabHistory.pos++;
    }
  }

  $(document).keyup(function(e) {
    if (e.which == 27) {
      $('#inputfield').focus();
    }
  });

  $('#inputfield').focus();

  $('#desknot').click(function() {
    if ($(this).prop('checked') && window.webkitNotifications) {
      $('#desknot').prop('checked', false);
      window.webkitNotifications.requestPermission(function(){
        if (window.webkitNotifications.checkPermission() == 2) {
          alert('You have denied desktop notifications from UbunTalk. To unblock them, please go to Preferences -> Under the Hood -> Content Settings -> Manage Exceptions (Notifications section).');
        } else if (window.webkitNotifications.checkPermission() == 0) {
            $('#desknot').prop('checked', true);
        }
      });
    }
  });

  if(!window.webkitNotifications) {
    $('#desktop').html('Your browser does not support desktop notifications');
  } else if (window.webkitNotifications.checkPermission() == 0) {
    $('#desknot').prop('checked', true);
  }
});

window.addEventListener('focus', function() {
  focused = true;
  $('#inputbox').focus();
  // desktop notification
  if (popup) popup.cancel();
  // flickering title
  clearInterval(flickeringTitle);
  delete flickeringTitle;
  document.title = originalDocTitle;
  // idle
  if (idle) {
    idle = false;
    reportIdleness();
  } else {
    if (idlePromise) clearTimeout(idlePromise);
  }
});

window.addEventListener('blur', function() {
  focused = false;
  // idle
  if (idlePromise) clearTimeout(idlePromise);
  idlePromise = setTimeout(function() {
    idle = new Date().getTime();
    reportIdleness();
  }, IDLE_TIMEOUT);
});


function reportIdleness() {
  if (idle) {
    socket.emit('idle', {since: new Date().getTime() - idle});
  } else {
    socket.emit('not idle');
  }
}

function refreshIdleTimes() {
  now = new Date().getTime();
  $('.idleSince').each(function() {
    since = now - parseInt($(this).attr('idleSince'));
    readableTime = '';
    if (since > ONE_HOUR) {
      readableTime = Math.floor(since / ONE_HOUR) + 'h';
    } else if (since > ONE_MINUTE) {
      readableTime = Math.floor(since / ONE_MINUTE) + 'm';
    } else {
      readableTime = 'just now';
    }
    $(this).text(readableTime);
  });
}

$(window).bind('beforeunload', function() {
  unloading = true;
});

function unique(a) {
  var o = {}, i, l = a.length, r = [];
  for(i=0; i<l;i+=1) o[a[i]] = a[i];
  for(i in o) r.push(o[i]);
  return r;
};
