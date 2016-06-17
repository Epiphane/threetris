var Input = (function() {
   var keyState = {};
   var KEYS     = {};
   var CODES    = {};

   document.onkeydown = function(evt) {
      keyState[evt.keyCode] = true;
   };
   document.onkeyup = function(evt) {
      keyState[evt.keyCode] = false;
   };

   var Input = {};

   Input.init = function(keys) {
      KEYS = keys;

      for (var key in KEYS) {
         CODES[KEYS[key]] = key;
      }
   };

   Input.getKey = function(name) {
      return keyState[KEYS[name]];
   };

   Input.onkeypress = function() {
      // Empty
   };

   return Input;
})();