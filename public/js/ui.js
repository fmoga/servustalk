// Resizes the important bits to make sure the app scales properly across the screen
function resize() {
  // Resize the main viewport
  $("#content").height(
    $(window).height() - $("#header").height() - $("#footer").height() - 35
  );

  // Resize the message scroller
  $("#messagebox").height(
    $("#content").height()
  );
}

$(document).ready(function() {
  resize();

  $(window).resize(function() {
    resize();
  });
});