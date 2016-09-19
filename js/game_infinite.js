/* 
 * Infinite Game screen
 * aka not classic
 */
InfiniteGame = (function() {
   return Game.extend({
      reduceFallDelay: function() {
         this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();