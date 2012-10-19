$.ajax('/loadMemes', {
  async: false,
  dataType: 'json',
  success: function(data) {
    ALLOWED_MEMES = {};
    for (i in data) {
      ALLOWED_MEMES[data[i].keyword] = data[i].url;
    }
  }
});
