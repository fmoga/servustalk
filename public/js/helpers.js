
/*=========================================================== 

  Helper functions
  
  Depends on config.js

===========================================================*/

// depends on config.js

escapeText = function(text) {
  return $('<div/>').text(text).html();
}

getProfileName = function(client, nameStyle) {
  // this line is still duplicated in getProfilePic
  // TODO: fix later its late
  var idle = client.idle ? 'idle' : '';
  var profileName = $('<span>').addClass('profilename')
                               .addClass(idle)
                               .addClass(nameStyle)
                               .html(client.name);
  return profileName;
}

getProfilePic = function(client) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';
  var profilePic = $('<img>').addClass('profilepic')
                             .addClass(idle)
                             .addClass('middle')
                             .attr('title', client.name)
                             .attr('src', picture);
  return profilePic;
}

getMockLocation = function() {
  return MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
}

getProfileLocation = function(client) {
  if (client.location) {
    link = $('<a>').attr('href', 'http://maps.google.com/?q=' + encodeURIComponent(client.location))
                   .attr('target', '_blank')
                   .html(escapeText(client.location));
  } else {
    link = getMockLocation();
  }
  return $('<span>').addClass('location').html(link);
}

idleSince = function(client) {
  return new Date().getTime() - client.idleFor;
}

getProfileIdle = function(client) {
  var idleSpan = $('<span>').addClass('idleSpan')
                            .attr('idleSince', idleSince(client));
  return client.idle ? idleSpan : '';
}

addClient = function(client, buddylist, nameStyle) {
  var profilePic = getProfilePic(client);
  var profileName = getProfileName(client, nameStyle);
  var profileLocation = getProfileLocation(client);
  var idleSince = getProfileIdle(client);

  var li = $('<li>').append(profilePic)
                    .append(profileName)
                    .append(idleSince)
                    .append(profileLocation);
  
  var inputField = $('textarea#inputfield');

  profilePic.on('click', function() {
    inputField.val(inputField.val() + '@' + client.name + ' ')
              .setCursorPosition(inputField.val().length).focus();
  });

  buddylist.append(li);
}

isMemeCmd = function(cmd) {
  return (result['cmd'] == '/meme' &&
          ALLOWED_MEMES.hasOwnProperty(result['meme']) &&
          result['topText'].length <= MAX_MEME_TEXT_LENGTH * 2 &&
          result['bottomText'].length <= MAX_MEME_TEXT_LENGTH * 2)
}

parseMemeCmd = function(stringCmd) {
  words = stringCmd.split(' ');
  text = stringCmd.split('"');
  result = {
    'topText': text[1] || '',
    'bottomText': text[3] || '',
    'cmd': words[0],
    'meme': words[1]
  }
  return result;
}

// used to update the meme canvas
// iterates through all the unprocessed memes and if they are not processed,
// memeify them
memeify = function() {
  canvasMemes = $('.meme');
  for (var i = 0; i < canvasMemes.length; i++) {
    canvas = $(canvasMemes[i]);
    if (canvas.attr('processed') != 'true') {
      var img = new Image();

      // I have no idea why I have to specify canvas[0], but hey - it works
      img.ctx = canvas[0].getContext("2d");
      var meme = canvas.attr('meme');
      
      img.topText = canvas.attr('topText').substr(0,MAX_MEME_TEXT_LENGTH);
      img.topTextExtra = canvas.attr('topText').substr(MAX_MEME_TEXT_LENGTH);

      img.bottomText = canvas.attr('bottomText').substr(0,MAX_MEME_TEXT_LENGTH);
      img.bottomTextExtra = canvas.attr('bottomText').substr(MAX_MEME_TEXT_LENGTH);

      // String beautifications
      if (img.topTextExtra != "") {
        if (img.topTextExtra[0] != " ") {
          img.topText += "-";
        } else {
          img.topTextExtra = img.topTextExtra.substr(1);
        }
      }

      if (img.bottomTextExtra != "") {
        if (img.bottomTextExtra[0] != " ") {
          img.bottomText += "-";
        } else {
          img.bottomTextExtra = img.topTextExtra.substr(1);
        }
      }

      img.onload = function() {
        ctx = this.ctx;
        // Imae
        ctx.drawImage(this, 0, 0);

        // Set font
        ctx.font = "20px Impact";
        
        // Stroke text
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 6;
        ctx.strokeText(this.topText, 5, 20);
        ctx.strokeText(this.topTextExtra, 5, 40);

        if (this.bottomTextExtra != "") {
          ctx.strokeText(this.bottomText, 5, 125);
          ctx.strokeText(this.bottomTextExtra, 5, 145);
        } else {
          ctx.strokeText(this.bottomText, 5, 145);
        }
        
        // Fill text
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(this.topText, 5, 20);
        ctx.fillText(this.topTextExtra, 5, 40);
        
        if (this.bottomTextExtra != "") {
          ctx.fillText(this.bottomText, 5, 125);
          ctx.fillText(this.bottomTextExtra, 5, 145);
        } else {
          ctx.fillText(this.bottomText, 5, 145);
        }
      }

      // Set image
      img.src = ALLOWED_MEMES[meme];
      canvas.attr('processed', true);
    }
  }
}

// https://en.wikipedia.org/wiki/Blink_element
blinkText = function() {
    for(i=0;i<document.all.tags('blink').length;i++) {
        s=document.all.tags('blink')[i];
        s.style.visibility=(s.style.visibility=='visible') ?'hidden':'visible';
    }
}
