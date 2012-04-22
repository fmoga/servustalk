addPorfilePic = function(client) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';
  return '<img class="profilepic ' + idle + ' middle" title="' +client.name + '" src="' + picture + '"/>'
}

addProfileName = function(client, nameStyle) {
  var idleSpan = $('<span>');
  idleSpan.addClass('idleSince');
  idleSpan.attr('idleSince', (new Date().getTime() - client.idleFor));
  
  var idleSince = client.idle ? idleSpan.html() : '';
  pName = $('<span>');
  pName.addClass('idleSince').addClass(nameStyle).html(client.name);
  return pName.html() + idleSince;
}

addClient = function(client, buddylist, nameStyle) {
  clientLi = $("<li>").html(addPorfilePic(client) + addProfileName(client, nameStyle));
  $(buddylist).html(clientLi);
}
