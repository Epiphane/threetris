/* 
 * Intro Game screen
 * aka not not classic
 */
IntroGame = (function() {
   return Game.extend({
      reduceFallDelay: function() {
         this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();