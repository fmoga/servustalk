var defaultPicture = "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg";
var lastUserActivity = {id: ''};
var currentClients = [];
var first = true;
var popup;
var focused = true;

$(document).ready(function() {
  var socket = io.connect();
  socket.on('connect', function() {
  });

  socket.on('message', function(message) {
    if (!focused && $('#desknot').prop('checked') && window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
      if (popup) {
        popup.cancel();
      }
      var picture = message.user.picture ? message.user.picture : defaultPicture;
      popup = window.webkitNotifications.createNotification(picture, message.user.name, message.message)
      popup.onclick = function() { 
        window.focus(); 
        this.cancel(); 
      };
      popup.show();
    }
    displayMessage(message);
  });

  socket.on('clients', function(clients) {
    var buddylist = $('#buddylist ul');
    $(buddylist).empty();
    var nameStyle = '';
    if ($('#toggle').attr('full') == '0') {
       nameStyle = 'style="display: none"';
    }
    $.each(clients, function(index, client) {
      var picture = defaultPicture;
      if (client.picture) picture = client.picture;
      $(buddylist).append('<li><img class="profilepic middle" title="' +client.name + '" src="' + picture + '"/><span class="profilename" ' + nameStyle + '>' + client.name + '</span></li>'); 
    });

    if (first) {
      first = false;
    } else {
      for (var i = 0; i < currentClients.length; i++) {
        var k = 0;
        while (k < clients.length && currentClients[i].id != clients[k].id) k++;
        if (k == clients.length) {
          displayNotification(currentClients[i].name + ' disconnected');
        }
      }
      for (var i = 0; i < clients.length; i++) {
        var k = 0;
        while (k < currentClients.length && clients[i].id != currentClients[k].id) k++;
        if (k == currentClients.length) {
          displayNotification(clients[i].name + ' connected');
        }
      }
    }
    currentClients = clients;
  });

  socket.on('history', function(history) {
    $('#messagebox .scrollr').empty();
    for (index in history) {
      displayMessage(history[index]);
    }
    displayNotification('Fetched latest messages sent to the room');
    scrollToBottom();
  });

  socket.on('disconnect', function() {
    var message = 'You have been disconnected from server for maintenance. Please refresh and log in again.';
    displayNotification(message, true);
  });

  function displayMessage(message) {
    if (message.user.id == lastUserActivity.id) {
      result = handleLinksAndEscape(message.message);
      console.log(result);
      var html = '<div>' + result.html + '</div>';
      html += addYoutubeLinks(result.youtube);
      html += addImagery(result.imagery);
      $('.author').last().append(html);
    } else {
      var html = '';
      if (lastUserActivity.id != '') {
        html += '<hr/>'; 
      }
      lastUserActivity = message.user;
      var picture = message.user.picture ? message.user.picture : defaultPicture;
      html += '<img class="profilepic" src="' + picture + '"/>';
      html += '<div class="author"><strong>' + $('<div/>').text(message.user.name).html() + '</strong>';
      var result = handleLinksAndEscape(message.message);
      console.log(result);
      html += '<div>' + result.html + '</div>';
      html += addYoutubeLinks(result.youtube);
      html += addImagery(result.imagery);
      html += '</div>';
      $('#messagebox .scrollr').append(html);
    }
    if (isScrolledToBottom()) scrollToBottom();
  }

  function handleLinksAndEscape(text) {
    var html = '';
    var youtube = [];
    var imagery = [];
    var index = text.indexOf('http://');
    while (index != -1) {
      textBeforeLink = text.substr(0, index);
      html += $('<div/>').text(textBeforeLink).html();
      var finish = index;
      while (finish < text.length && !isWhitespace(text[finish])) finish++;
      var link = text.substr(index, finish-index+1);
      html += '<a target="_tab" href="' + link + '">' + $('<div/>').text(link).html() + '</a>';
      // check for youtube links
      if (link.indexOf('http://www.youtube.com') == 0) {
        youtube.push(link); 
      };
      // check for imagery content
      var lowerLink = link.toLowerCase();
      var ext = 0;
      var formats = ['.gif', '.jpg', '.jpeg', '.png' ];
      for (ext in formats) {
        if (lowerLink.indexOf(formats[ext]) != -1) {
          imagery.push(link);
          break;
        }
      }
      
      if (finish == text.length) {
        text = '';
      } else {
        text = text.substr(finish);
      }
      index = text.indexOf('http://');
    }
    html += $('<div/>').text(text).html();
    return {
      html : html,
      youtube : youtube,
      imagery : imagery
    }
  }
  
  function addYoutubeLinks(links) {
    var html = '';
    $.each(links, function(index, link) {
      var params = getUrlVars(link);
      if (params.v) {
        html += '<div><iframe onload="checkYoutubeScrolling()" width="420" height="315" src="http://www.youtube.com/embed/' + params.v + '" frameborder="0" allowfullscreen></iframe></div>';
      }
    });
    return html;
  }

  function addImagery(links) {
    var html = '<div id="imageDock">'; 
    $.each(links, function(index, link) {
      html += '<a target="_tab" href="' + link + '"><img id="imageLink" onload="checkImageScrolling()" src="' + link + '"/></a>';
    });
    html += '</div>';
    return html;
  }

  function displayNotification(notification, attention) {
    var classes = 'notification';
    if (attention) classes += ' attention';
    var html = '<div class="' + classes + '">' + notification + '</div>';
    $('#messagebox .scrollr').append(html);
    lastUserActivity = {id: ''};
    if (isScrolledToBottom()) scrollToBottom();
  }

  $('#toggle').click(function() {
    if ($(this).attr('full') == '1') {
      $('.profilename').hide();
      $(this).attr('full', '0');
      $(this).html('&laquo;');
      $('#buddylist').css('min-width', '80px');
    } else {
      $('.profilename').show();
      $(this).attr('full', '1');
      $(this).html('&raquo;');
      $('#buddylist').css('min-width', '200px');
    }
  });

  $('#inputfield').keypress(function(event) {
    if (event.which == 13) {
      var text = $('#inputfield').val(); 
      $('#inputfield').val('');
      socket.emit('message', text);
      return false;
    }
  });

  $(document).keyup(function(event) {
    if (event.which == 27) {
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
  if (popup) popup.cancel();
  focused = true;
});

window.addEventListener('blur', function() {
  focused = false;
});

function scrollToBottom() {
  var messagebox = $('#messagebox .scrollr');
  $(messagebox).animate({ scrollTop: $(messagebox).prop("scrollHeight") }, 0);
}

function isScrolledToBottom() {
  return isScrolledToBottomWithThreshold(50);
}

function isScrolledToBottomWithThreshold(threshold) {
  var elem = $('#messagebox .scrollr');
  if (elem[0].scrollHeight - elem.scrollTop() < elem.outerHeight() + threshold) {
    return true;
  }
  return false;
}
function checkYoutubeScrolling() {
  if (isScrolledToBottomWithThreshold(400)) {
    scrollToBottom();
  }
}
function checkImageScrolling() {
  if (isScrolledToBottomWithThreshold(500)) {
    scrollToBottom();
  }
}

function isWhitespace(ch) { 
  return " \t\n\r\v".indexOf(ch) != -1;
} 

function getUrlVars(link) {
  var vars = [], hash;
  var hashes = link.slice(link.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
