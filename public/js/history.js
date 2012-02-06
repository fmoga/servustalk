function getHistory(date) {
  $.ajax({
      url: "/getHistory/"+date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate()+"/",
      type: "POST",
      success: function(data) {
          $("#messagebox .scrollr").empty();
          for (idx in data.messages) {
              displayMessage(data.messages[idx], false, false);
          }
      },
  });
}

$(document).ready(function() {
    $.SyntaxHighlighter.init({
      'lineNumbers': true,
      'baseUrl' : 'public/syntaxhighlighter',
      'themes' : ['ubutalk'],
      'theme': 'ubutalk'
    });

    $("#datepicker").datepicker({
        onSelect: function(dateText, inst) {
                      date = new Date(inst.currentYear, inst.currentMonth, inst.currentDay, 0, 0, 0, 0);
                      getHistory(date);
                  }
    });
    getHistory(new Date());
});
