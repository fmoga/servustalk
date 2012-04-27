$(document).ready(function() {
  $('#hoverFun').css('position', 'absolute');
  $('#hoverFun').on('hover', function() {
    console.log(this);
    $('#hoverFun').css('top', Math.floor(Math.random() * 200));
    $('#hoverFun').css('left', Math.floor(Math.random() * 200));
  });
});

