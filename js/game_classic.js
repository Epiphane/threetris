/* 
 * Classic Game screen
 * aka not not classic
 */
ClassicGame = (function() {
   return ActiveGame.extend({
      gameType: 'classic',

      nextLevel: function() {
         if (this.level === 15) {
            // GG
            this.gameEnded = true;

            this.you_win.fadeTo(0.97);
         }
         else {
            ActiveGame.prototype.nextLevel.apply(this, arguments);
         }
      },

      reduceFallDelay: function() {
         if (this.fallDelay > 4)
            this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();