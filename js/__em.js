var __em = (function() {
   var url = 'http://thomassteinke.com/threetris/__em.php';

   var sandbox = (location.href.indexOf('localhost') >= 0);

   var __em = {
      init: function() {
         if (sandbox) return;

         $.post(url, {
            type: 'view'
         });
      },

      startGame: function(mode) {
         if (sandbox) return;

         $.post(url, {
            type: 'play',
            data: JSON.stringify({
               mode: mode
            })
         });
      },

      finishGame: function(win, score) {
         if (sandbox) return;
         
         $.post(url, {
            type: 'finish',
            data: JSON.stringify({
               win: win,
               score: score
            })
         });
      }
   };

   return __em;
})();