/* 
 * Score screen
 */
Score = (function() {
   return Screen2D.extend({
      constructor: function(width, height, game_type, score, stats) {
         Screen2D.apply(this, arguments);

         window.scores = this;

         this.score = score;
         this.stats = stats;

         // Create the objects
         this.title = new ThreeImage('score_rendered.png');
         this.scene.add(this.title);

         this.hudScore = SpecialCube.Group.FromString('' + score);
         this.hudScore.position.set(150, 35, 0);
         this.hudScore.scale.setScalar(3);
         this.scene.add(this.hudScore);
      },

      key_SPACE: function() {
         Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT));
      },
   });
})();