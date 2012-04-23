// jQuery plugin to get textarea cursor position
(function ($, undefined) {
  $.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
      pos = el.selectionStart;
    } else if('selection' in document) {
      el.focus();
      var Sel = document.selection.createRange();
      var SelLength = document.selection.createRange().text.length;
      Sel.moveStart('character', -el.value.length);
      pos = Sel.text.length - SelLength;
    }
    return pos;
  }
})(jQuery);

// jQuery plugin to set textarea cursor position
(function ($, undefined) {
  $.fn.selectRange = function(start, end) {
    this.each(function(index, elem) {
      if (elem.setSelectionRange) {
        elem.focus();
        elem.setSelectionRange(start, end);
      } else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    });
    return this;
  }
})(jQuery);

// jQuery plugin to set textarea cursor position wrapper
(function ($, undefined) {
  $.fn.setCursorPosition = function(index) {
    this.selectRange(index, index);
    return this;
  }
})(jQuery);
