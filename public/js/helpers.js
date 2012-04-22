addClient = function(client, buddylist, nameStyle) {
  // vars
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';

  // profile pic
  var profilePic = $('<img>');
  profilePic.addClass('profilepic');
  profilePic.addClass(idle);
  profilePic.addClass('middle');
  profilePic.attr('title', client.name);
  profilePic.attr('src', picture);

  // profile name
  var profileName = $('<span>');
  profileName.addClass('profilename');
  profileName.addClass(idle);
  profileName.addClass(nameStyle);
  profileName.html(client.name);

  // idle since
  var idleSpan = $('<span>');
  idleSpan.addClass('idleSpan');
  idleSpan.attr('idleSince', (new Date().getTime() - client.idleFor));
  idleSpan = '<span class="idleSince" idleSince="' + (new Date().getTime() - client.idleFor) + '"></span>';
  var idleSince = client.idle ? idleSpan : '';

  // the li
  var li = $('<li>');
  li.append(profilePic);
  li.append(profileName);
  li.append(idleSince);

  buddylist.append(li);
}
