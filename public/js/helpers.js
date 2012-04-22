addClient = function(client, buddylist, nameStyle) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';

  var profilePic = $('<img>'); // profile pic
  profilePic.addClass('profilepic');
  profilePic.addClass(idle);
  profilePic.addClass('middle');
  profilePic.attr('title', client.name);
  profilePic.attr('src', picture);

  var profileName = $('<span>'); // profile name
  profileName.addClass('profilename');
  profileName.addClass(idle);
  profileName.addClass(nameStyle);
  profileName.html(client.name);

  var locationSpan = $('<span>');
  locationSpan.addClass('location');
  locationSpan.html(client.location);
  var profileLocation = client.location ? locationSpan : ''; // location
  
  var idleSpan = $('<span>');
  idleSpan.addClass('idleSpan');
  idleSpan.attr('idleSince', (new Date().getTime() - client.idleFor));
  idleSpan = '<span class="idleSince" idleSince="' + (new Date().getTime() - client.idleFor) + '"></span>';
  var idleSince = client.idle ? idleSpan : ''; // idle since

  // the li
  var li = $('<li>');
  li.append(profilePic);
  li.append(profileName);
  li.append(idleSince);
  li.append(profileLocation);

  buddylist.append(li);
}
