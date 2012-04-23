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
  return $('<span>').addClass('location')
                    .html(client.location ? client.location : getMockLocation());
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

  li.on('click', function() {
    inputField.val(inputField.val() + '@' + client.name + ' ')
              .setCursorPosition(inputField.val().length).focus();
  });

  buddylist.append(li);
}
