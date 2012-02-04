var DEFAULT_PICTURE = "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg";
var MAX_TIMESTAMP_DIFF = 60000; // 1 min
var VIRTUAL_USER = { id: ''};

var lastMessage = {
  user: VIRTUAL_USER
};

function displayMessage(message) {
  var processedMessage = processMessage(message);
  if (message.user.id == lastMessage.user.id && message.ts < lastMessage.ts + MAX_TIMESTAMP_DIFF ) {
    $('.author').last().append(processedMessage.html);
  } else {
    var html = '';
    if (lastMessage.user.id != VIRTUAL_USER.id) {
      html += '<hr/>'; 
    }
    var picture = message.user.picture ? message.user.picture : DEFAULT_PICTURE;
    html += '<img class="profilepic" src="' + picture + '"/>';
    html += '<div class="author"><strong>' + $('<div/>').text(message.user.name).html() + '</strong><span class="timestamp">' + formatTimestamp(message.ts) + '</span>';
    html += processedMessage.html;
    html += '</div>';
    $('#messagebox .scrollr').append(html);
  }
  lastMessage = message;
}

function processMessage(message){
    var result = handleLinksAndEscape(message.text);
    var html = '<div>' + result.html + '</div>';
    html += addYoutubeLinks(result.youtube);
    html += addMixcloudLinks(result.mixcloud);
    html += addSoundcloudLinks(result.soundcloud);
    html += addImagery(result.imagery);
    return {
      html: html,
      scrollSize: guessMessageScrollSize(result)
    }
}

function guessMessageScrollSize(processedMessage) {
  return 75 + processedMessage.youtube.length * 340 + processedMessage.mixcloud.length * 485 + processedMessage.soundcloud.length * 90 + processedMessage.imagery.length * 425;
}

function formatTimestamp(ts) {
  var timestamp = new Date(ts);
  var now = new Date();
  var dayOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var date;
  if (timestamp.getDate() == now.getDate() && timestamp.getMonth() === now.getMonth() && timestamp.getFullYear() == timestamp.getFullYear()) {
    date = 'Today';  
  } else {
    date = dayOfWeek[timestamp.getDay()] + ', ' + timestamp.getDate() + ' ' + month[timestamp.getMonth()] + ' ' + timestamp.getFullYear();
  }
  var time = padTime(timestamp.getHours()) + ':' + padTime(timestamp.getMinutes()); 
  return date + ' at ' + time;
}

function padTime(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function handleLinksAndEscape(text) {
  var html = '';
  var youtube = [];
  var mixcloud = [];
  var soundcloud = [];
  var imagery = [];
  var linkMatch = /http[s]?:///g
  var index = text.search(linkMatch);
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
    if (link.indexOf('http://www.mixcloud.com') == 0) {
      mixcloud.push(link); 
    };
    if (link.indexOf('http://soundcloud.com') == 0) {
      soundcloud.push(link); 
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
    index = text.search(linkMatch);
  }
  html += $('<div/>').text(text).html();
  return {
    html : html,
    youtube : youtube,
    mixcloud: mixcloud,
    soundcloud: soundcloud,
    imagery : imagery
  }
}

function addYoutubeLinks(links) {
  var html = '';
  $.each(links, function(index, link) {
    var params = getUrlVars(link);
    if (params.v) {
      html += '<div><iframe width="420" height="315" src="http://www.youtube.com/embed/' + params.v + '" frameborder="0" allowfullscreen></iframe></div>';
    }
  });
  return html;
}

function addSoundcloudLinks(links) {
  var html = '';
  $.each(links, function(index, link) {
    html += '<div class="soundcloud">';
    html += '<object height="81" width="100%">'; 
    html += '  <param name="movie" value="https://player.soundcloud.com/player.swf?url=' + encodeURIComponent(link) + '&amp;show_comments=true&amp;auto_play=false&amp;color=ff7700"></param>';
    html += '  <param name="allowscriptaccess" value="always"></param>';
    html += '  <embed allowscriptaccess="always" height="81" src="https://player.soundcloud.com/player.swf?url=' + encodeURIComponent(link) + '&amp;show_comments=true&amp;auto_play=false&amp;color=ff7700" type="application/x-shockwave-flash" width="100%"></embed>';
    html += '</object>';   
    html += '</div>';
  });
  return html;
}

function addMixcloudLinks(links) {
  var html = '';
  $.each(links, function(index, link) {
    html += '<div class="mixcloud">';
    html += '<object width="480" height="480">';
    html += '  <param name="movie" value="http://www.mixcloud.com/media/swf/player/mixcloudLoader.swf?feed=' + encodeURIComponent(link) + '&embed_uuid=cf33541f-9302-42e5-91bb-597a70dc852d&stylecolor=&embed_type=widget_standard"></param>';
    html += '  <param name="allowFullScreen" value="true"></param>';
    html += '  <param name="wmode" value="opaque"></param>';
    html += '  <param name="allowscriptaccess" value="always"></param>';
    html += '  <embed src="http://www.mixcloud.com/media/swf/player/mixcloudLoader.swf?feed=' + encodeURIComponent(link) + '&embed_uuid=cf33541f-9302-42e5-91bb-597a70dc852d&stylecolor=&embed_type=widget_standard" type="application/x-shockwave-flash" wmode="opaque" allowscriptaccess="always" allowfullscreen="true" width="480" height="480"></embed>';
    html += '</object>';
    html += '</div>';
  });
  return html;
}

function addImagery(links) {
  var html = '';
  $.each(links, function(index, link) {
    html += '<a target="_tab" href="' + link + '"><img id="imageLink" src="' + link + '"/></a>';
  });
  if (html !== '') {
    html = '<div id="imageDock">' + html + '</div>';
  }
  return html;
}

function isWhitespace(ch) {
  return " \t\n\r\v".indexOf(ch) != -1;
}

$(document).ready(function() {
    $.ajax({
        url: "/getHistory",
        type: "POST",
        success: function(data) {
            for (idx in data.messages) {
                displayMessage(data.messages[idx]);
            }
        },
    });
});
