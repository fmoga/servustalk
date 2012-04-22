function resize() {
  $("#content").height(
    $(window).height() - $("#header").height() - $("#footer").height() - 35
  );

  if ($("#messagebox").hasClass('history')) {
    $("#messagebox").height(
      $("#content").height() - 20
    );
  } else {
    $("#messagebox").height(
      $("#content").height() - 60 - 20
    );
  }
}

$(document).ready(function() {
  resize();

  $(window).resize(function() {
    resize();
  });
});