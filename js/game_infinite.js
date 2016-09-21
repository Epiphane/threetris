/* 
 * Infinite Game screen
 * aka not classic
 */
InfiniteGame = (function() {
   return ActiveGame.extend({
      gameType: 'infinite',

      reduceFallDelay: function() {
         this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();