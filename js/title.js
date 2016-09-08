/* 
 * Title screen
 */
Title = (function() {
   return Screen2D.extend({
      constructor: function(width, height) {
         Screen2D.apply(this, arguments);

         this.titleStart = 15;
         this.titleDest = 30;

         // Create the objects
         this.title = SpecialCube.Group.FromImage('./textures/title.png');
         this.title.position.y = this.titleStart;
         this.scene.add(this.title);

         this.press_space = SpecialCube.Group.FromString('PRESS SPACE');
         this.press_space.position.y = -30;
         this.scene.add(this.press_space);

         this.transitioning = false;
         this.transitionMax = 1;
         this.transitionTime = 0;
      },

      key_SPACE: function() {
         this.transitioning = true;

         this.press_space.fadeTo(0, 1);
         this.title.moveTo(new THREE.Vector3(0, 30, 0), 1, function() {
            Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT));
         });
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);

         this.title.update(dt);
         this.press_space.update(dt);
      },
   });
})();