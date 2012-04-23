getProfileName = function(client, nameStyle) {
  // this line is still duplicated in getProfilePic
  // TODO: fix later its late
  var idle = client.idle ? 'idle' : '';
  var profileName = $('<span>');
  profileName.addClass('profilename');
  profileName.addClass(idle);
  profileName.addClass(nameStyle);
  profileName.html(client.name);
  return profileName;
}

getProfilePic = function(client) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';
  var profilePic = $('<img>');
  profilePic.addClass('profilepic');
  profilePic.addClass(idle);
  profilePic.addClass('middle');
  profilePic.attr('title', client.name);
  profilePic.attr('src', picture);
  return profilePic;
}

getProfileLocation = function(client) {
  var locationSpan = $('<span>');
  locationSpan.addClass('location');
  locationSpan.html(client.location);
  var profileLocation = client.location ? locationSpan : '';
  return profileLocation;
}

getProfileIdle = function(client) {
  var idleSpan = $('<span>');
  idleSpan.addClass('idleSpan');
  idleSpan.attr('idleSince', (new Date().getTime() - client.idleFor));
  var idleSince = client.idle ? idleSpan : '';
  return idleSince;
}

addClient = function(client, buddylist, nameStyle) {
  var profilePic = getProfilePic(client);
  var profileName = getProfileName(client, nameStyle);
  var profileLocation = getProfileLocation(client);
  var idleSince = getProfileIdle(client);

  var li = $('<li>');
  li.append(profilePic);
  li.append(profileName);
  li.append(idleSince);
  li.append(profileLocation);
  

  // When clicking a user in the buddy list, mention that user.
  li.on('click', function() {
    $('textarea#inputfield').append("@" + client.name + " ");
  });

  buddylist.append(li);
}
