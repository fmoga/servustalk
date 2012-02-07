var MESSAGES_PER_PAGE = 100;

function getHistory(date) {
  $.ajax({
      url: "/getHistory/"+date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate()+"/",
      type: "POST",
      success: function(data) {
          var count = 1;
          if (data.messages.length > 0) {
            count = Math.floor((data.messages.length-1) / MESSAGES_PER_PAGE) + 1;
          }
          $('#pagination').paginate({
            count: count,
            start: 1,
            display: 5,
            border					: true,
				    border_color			: '#CCC',
            border_hover_color : '#FBCB09',
            text_color  			: '#1C94C4',
            text_hover_color  		: '#C77405',
            background_color    	: '#F6F6F6',	
            background_hover_color	: '#FDF5CE', 
            images		: false,
            mouse		: 'press',
            onChange: function(page) {
              var p = parseInt(page);
              resetDisplayArea();
              for (i=(p-1)*MESSAGES_PER_PAGE; i < data.messages.length && i < p*MESSAGES_PER_PAGE; i++) {
                  displayMessage(data.messages[i], false, true);
              }
            }
          });
          $('.jPag-pages li').first().click()
      },
  });
}

function resetDisplayArea() {
  $("#messagebox .scrollr").empty();
  lastMessage = { user: NO_USER };
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
