/*=========================================================== 

  Used to build and render the UI 

===========================================================*/

// Sets the content's height according to the windows
function resize() {
  // Resize the main viewport
  $("#content").height(
    $(window).height() - $("#header").height() - $("#footer").height() - 25
  );

  // Resize the message scroller
  $("#messagebox").height(
    $("#content").height()
  );
}

// Apply the rules on ready and with each resize
$(document).ready(function() {
  resize();

  $(window).resize(function() {
    resize();
  });
});

// Preloader

$(document).ready(function () {
  $(".loading").removeClass('loading');
  $(".preloader").removeClass('preloader');
  resize();
    UI.init();
});
//UI
var Utils = {
    store: function( namespace, data ) {
        if ( arguments.length > 1 ) {
            return localStorage.setItem( namespace, JSON.stringify( data ) );
        } else {
            var store = localStorage.getItem( namespace );
            return ( store && JSON.parse( store ) ) || [];
        }
    }
};

var UI = {
    init:function(){
        this.theme= Utils.store("theme")|| "";
        if(this.theme=="")this.theme="custom";

        this.cacheElements();
        this.bindEvents()
        this.updateTheme();
    },
    cacheElements:function(){
        this.$theme_link=$("#theme_link");        

    },
    bindEvents:function(){
        $("#themeLight").click(function(){
            UI.setTheme("custom");
        })
        $("#themeDark").click(function(){
            UI.setTheme("custom_dark");
        })
    },
    setTheme:function(theme){
        this.theme=theme;
        Utils.store("theme",theme);
        UI.updateTheme();
    },
    updateTheme:function(){
        this.$theme_link.attr("href","/public/css/"+this.theme+".css");
    }
}
