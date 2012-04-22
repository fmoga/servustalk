addPorfilePic = function(client) {
  var picture = client.picture ? client.picture : DEFAULT_PICTURE;
  var idle = client.idle ? 'idle' : '';
  return '<img class="profilepic ' + idle + ' middle" title="' +client.name + '" src="' + picture + '"/>'
}

addProfileName = function(client, nameStyle) {
  var idleSince = client.idle ? '<span class="idleSince" idleSince="' + (new Date().getTime() - client.idleFor) + '"></span>' : '';
  return '<span class="profilename ' + idle + '" ' + nameStyle + '>' + client.name + '</span>' + idleSince
}

addClient = function(client, buddylist, nameStyle) {
  clientLi = $("<li>").html(addPorfilePic(client) + addProfileName(client, nameStyle));
  $(buddylist).html(clientLi);
}
