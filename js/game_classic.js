/* 
 * Classic Game screen
 * aka not not classic
 */
ClassicGame = (function() {
   return Game.extend({
      reduceFallDelay: function() {
         if (this.fallDelay > 4)
            this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();