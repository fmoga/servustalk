addProfileName = function(client, nameStyle) {
  var idle = client.idle ? 'idle' : '';
  var profileName = $('<span>');
  profileName.addClass('profilename');
  profileName.addClass(idle);
  profileName.addClass(nameStyle);
  profileName.html(client.name);
  return profileName;
}

addProfilePic = function(client) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';
  var profilePic = $('<img>'); // profile pic
  profilePic.addClass('profilepic');
  profilePic.addClass(idle);
  profilePic.addClass('middle');
  profilePic.attr('title', client.name);
  profilePic.attr('src', picture);
  return profilePic;
}

addLocation = function(client) {
  var locationSpan = $('<span>');
  locationSpan.addClass('location');
  locationSpan.html(client.location);
  var profileLocation = client.location ? locationSpan : '';
  return profileLocation;
}

addIdleSince = function(client) {
  var idleSpan = $('<span>');
  idleSpan.addClass('idleSpan');
  idleSpan.attr('idleSince', (new Date().getTime() - client.idleFor));
  var idleSince = client.idle ? idleSpan : '';
  return idleSince;
}

addClient = function(client, buddylist, nameStyle) {
  var profilePic = addProfilePic(client);
  var profileName = addProfileName(client, nameStyle);
  var profileLocation = addLocation(client);
  var idleSince = addIdleSince(client);

  var li = $('<li>');
  li.append(profilePic);
  li.append(profileName);
  li.append(idleSince);
  li.append(profileLocation);

  buddylist.append(li);
}
