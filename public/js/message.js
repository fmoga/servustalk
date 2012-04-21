// depends on config.js

var NO_USER = { id: ''};
var NO_MESSAGE = {
  user: NO_USER
};
var lastMessage = NO_MESSAGE;

function displayMessage(message, autoscroll, displayInline) {
  var wasScrolledToBottom = isScrolledToBottom();
  if (message.text.indexOf('/#') == 0) { // colored alert
    var color = message.text.substring(1, message.text.indexOf(' '));
    if (!color.match(/[a-fA-F0-9]{6}|[a-fA-F0-9]{3}/g)) {
        color = '#3B5';
    }
    html = '';
    html += '<div class="alert" style="background: ' + color + '">';
    if (message.user.id !== 'ServusTalk') {
      // not system announcement, add user name
      html += message.user.name + ': ';
    }
    html += htmlEncode(message.text.substring(message.text.indexOf(' ') + 1))  + ' </div>';
    $('#messagebox .scrollr').append(html);
    if (autoscroll && wasScrolledToBottom) scrollToBottom();
    lastMessage = NO_MESSAGE;        
  } else {
    var userMention = '@' + $('#loggedUser').html();
    var processedMessage = processMessage(message, userMention, autoscroll && wasScrolledToBottom, displayInline);
    if (message.user.id == lastMessage.user.id && message.ts < lastMessage.ts + MAX_TIMESTAMP_DIFF ) {
      $('.author').last().append(processedMessage);
    } else {
      var html = '';
      if (lastMessage.user.id != NO_USER.id) {
        html += '<hr/>'; 
      }
      var picture = message.user.picture ? message.user.picture : DEFAULT_PICTURE;
      html += '<img class="profilepic" src="' + picture + '"/>';
      html += '<div class="author"><strong>' + $('<div/>').text(message.user.name).html() + '</strong><span class="timestamp">' + formatTimestamp(message.ts) + '</span>';
      html += processedMessage;
      html += '</div>';
      $('#messagebox .scrollr').append(html);
    }

    $('code').syntaxHighlight();
    lastMessage = message;
    if (autoscroll && wasScrolledToBottom) {
      scrollToBottom();
    }
  }
}

function processMessage(message, userMention, scroll, displayInline){
    var result = handleLinksAndEscape(message.text);
    result.html = handleMentions(result.html, userMention);
    var classes = 'messageContent';
    if (hasMention(result.html, userMention)) {
      classes += ' mention';
    }
    var html = '<div class="' + classes + '">' + result.html + '</div>';
    if (displayInline) {
      html += addYoutubeLinks(result.youtube);
      html += addMixcloudLinks(result.mixcloud);
      html += addSoundcloudLinks(result.soundcloud);
      html += result.imagery;
    }
    return html;
}

function hasMention(text, mention) {
  return text.indexOf(mention) != -1;
}

function handleMentions(text, mention) {
    var r = new RegExp(mention, 'g');
    /*
    if (!focused && text.match(r)) {
      $('#noise').html('<embed src="' + MENTION_SOUND + '" hidden=true autostart=true loop=false>');
    }
    */
    return text.replace(r, '<strong>' + mention + '</strong>');
}

function formatTimestamp(ts) {
  var timestamp = new Date(ts);
  var now = new Date();
  var date;
  if (timestamp.getDate() == now.getDate() && timestamp.getMonth() === now.getMonth() && timestamp.getFullYear() == timestamp.getFullYear()) {
    date = 'Today';  
  } else {
    date = DAY_OF_WEEK[(timestamp.getDay()+6)%7] + ', ' + timestamp.getDate() + ' ' + MONTH[timestamp.getMonth()] + ' ' + timestamp.getFullYear();
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

function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
  

function handleLinksAndEscape(text) {
  var html = '';
  var youtube = [];
  var mixcloud = [];
  var soundcloud = [];
  var imagery = '';
  var linkMatch = /http[s]?:///g
  var index = text.search(linkMatch);
  while (index != -1) {
    textBeforeLink = text.substr(0, index);
    //html += $('<div/>').text(textBeforeLink).html();
    html += getHtmlWithSmilyes(textBeforeLink);
  var finish = index;
    while (finish < text.length && !isWhitespace(text[finish])) finish++;
    var link = text.substr(index, finish-index+1);
    if(link){
    	link = link.replace('"', '%22');
    }
    html += '<a target="_blank" href="' + link + '">' + $('<div/>').text(link).html() + '</a>';
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
    if (link.indexOf('http://youtu.be') == 0) {
      youtube.push(link.replace(/\?/g, '&').replace(/youtu\.be\//g, 'youtube.com/watch?v='));
    }
    // check for imagery content
    var scrolled = isScrolledToBottom() ? ' onload="scrollToBottom()"' : '';
    imagery += '<a target="_blank" href="' + link +'"><img id="imageLink" src="' + link + '"' + scrolled + ' onerror="this.style.display = \'none\'"></img></a>';

    if (finish == text.length) {
      text = '';
    } else {
      text = text.substr(finish);
    }
    index = text.search(linkMatch);
  }
  //html += $('<div/>').text(text).html();
  html += getHtmlWithSmilyes(text);
  // handle [code]snippets[/code]
  html = html.replace("[code]", "<code class='highlight'>");
  html = html.replace("[/code]", "</code>");
  
  imagery = '<div id="imageDock">' + imagery + '</div>';

  return {
    html : html,
    youtube : youtube,
    mixcloud: mixcloud,
    soundcloud: soundcloud,
    imagery : imagery
  }
}

function paramize(text) {
  if (!text.match(/(\d\d?m)?\d\d?s/g)) {
    alert(text);
    return '';
  };
  var time = 0;
  if (text.indexOf('m') >= 0)
    time = parseInt(text.substring(0, text.indexOf('m')));
  time = time * 60 + parseInt(text.substring(text.indexOf('m') + 1, text.indexOf('s')));
  return '&start=' + time;
}

function addYoutubeLinks(links) {
  var html = '';
  $.each(links, function(index, link) {
    var params = getUrlVars(link);
    var timestamp = params.t ? paramize(params.t) : '';
    if (params.v) {
      html += '<div><iframe width="420" height="315" src="http://www.youtube.com/v/' + params.v + timestamp + '" frameborder="0" allowfullscreen></iframe></div>';
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

function addImagery(links, scroll) {
  var onload = scroll ? 'onload="scrollToBottom()"' : '';
  var html = '';
  $.each(links, function(index, link) {
    html += '<a target="_blank" href="' + link + '"><img id="imageLink" ' + onload + ' src="' + link + '"/></a>';
  });
  if (html !== '') {
    html = '<div id="imageDock">' + html + '</div>';
  }
  return html;
}

function displayNotification(notification, attention, autoscroll) {
  var wasScrolledToBottom = isScrolledToBottom();
  var classes = 'notification';
  if (attention) classes += ' attention';
  var html = '<div class="' + classes + '">' + notification + '</div>';
  $('#messagebox .scrollr').append(html);
  lastMessage = NO_MESSAGE;
  if (autoscroll && wasScrolledToBottom) scrollToBottom();
}

function scrollToBottom() {
  var messagebox = $('#messagebox .scrollr');
  $(messagebox).animate({ scrollTop: $(messagebox).prop("scrollHeight") + 20 }, 0);
}

function isScrolledToBottom() {
  var elem = $('#messagebox .scrollr');
  if (elem[0].scrollHeight - elem.scrollTop() < elem.outerHeight() + 5) {
    return true;
  }
  return false;
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

function escapeText(text) {
  return $('<div/>').text(text).html();
}


function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

function getHtmlWithSmilyes(text)
{
	for (var i = 0; i < EMOTICONS.length; i ++)
	{
		var pos = text.indexOf(EMOTICONS[i].code);
		if ( pos >= 0)
		{
			return getHtmlWithSmilyes(text.substring(0, pos)) + 
				getSmyleHtml(EMOTICONS[i]) + 
				getHtmlWithSmilyes(text.substring(pos+EMOTICONS[i].code.length, text.length));	}	
	}
	return htmlEncode(text);
}

function getSmyleHtml(smyle)
{
  // custom checks for text emoticons
  if (smyle.code == '\n') {
      return '<br/>';
  } else if (smyle.code == 'boian') {
    return 'ಠ_ಠ';
  }
	return '<img class="emoticon" src="' + smyle.url + '" title=\'' + smyle.code + '\' alt=\'' + smyle.code + '\'/>';
}
