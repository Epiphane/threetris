/* 
 * Intro Game screen
 * aka not not classic
 */
IntroGame = (function() {
   return ActiveGame.extend({
      reduceFallDelay: function() {
         this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
      }
   });
})();