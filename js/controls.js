/* 
 * Controls screen
 */
Controls = (function() {
   return Screen2D.extend({
      constructor: function(width, height, MenuState) {
         Screen2D.apply(this, arguments);

         this.MenuState = MenuState;

         // Create the objects
         this.title = new ThreeImage('controls_rendered.png');
         this.scene.add(this.title);
      },

      key_SPACE: function() {
         Juicy.Game.setState(this.MenuState);
      },
   });
})();