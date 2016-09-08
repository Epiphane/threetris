/* 
 * Menu screen
 */
Menu = (function() {
   // options passed during each spawned
   blastOptions = {
      position: new THREE.Vector3(),
      positionRandomness: .2,
      velocity: new THREE.Vector3(0., 2., 0.),
      velocityRandomness: .2,
      color: 0xffffff,
      colorRandomness: .2,
      turbulence: 0,
      lifetime: 2,
      size: 6,
      sizeRandomness: 1
   };

   return Screen2D.extend({
      constructor: function(width, height) {
         var self = this;
         window.game = this;
         Screen2D.apply(this, arguments);

         // Create the objects
         this.title = SpecialCube.Group.FromImage('./textures/title.png');
         this.title.position.y = 30;
         this.scene.add(this.title);

         this.menu_items = ['CLASSIC ', 'INFINITE', 'CREDITS '];

         this.menu_objects = this.menu_items.map(function(string, index) {
            var menu_object = SpecialCube.Group.FromString(string);

            // menu_object.material.color.setRGB(1, 1, 1);
            menu_object.position.x = 20;
            menu_object.position.y = -10 - index * 15;
            menu_object.scale.x = 0.75;
            menu_object.scale.y = 0.75;
            menu_object.opacity = 0;
            menu_object.index = index;

            menu_object.update(0);

            self.scene.add(menu_object);
            return menu_object;
         });

         function doneAnimating(index) {
            var next = index + 1;
            return function() {
               if (next < self.menu_objects.length) {
                  self.menu_objects[next].fadeTo(1, 0.6);
                  self.menu_objects[next].moveTo(new THREE.Vector3(20, -5 - next * 15, 0), 0.6, doneAnimating(next));
               }
            }
         }

         doneAnimating(-1)();

         this.selector = new Cube.Group();
         this.selector.addCube(0, 0, 0);
         this.selector.material.color = new THREE.Color(1, 0, 1);
         this.selector.scale.setScalar(5);
         this.selector.position.x = -15;
         this.selector.position.y = -6;
         this.scene.add(this.selector);

         this.selector_cube = this.selector.children[0];
         this.selector_cube.rotation.y = Math.PI / 4;
         this.selector_cube.rotation.x = Math.PI / 8;
         this.selector_cube.float_time = 0;

         this.selection = 0;
         this.selectionAnimationTime = 1.5;
      },

      key_SPACE: function() {
         var self = this;
         this.menu_objects.forEach(function(object, index) {
            if (index !== self.selection) {
               self.scene.remove(object);
            }
         });

         var selected = this.menu_objects[this.selection];
         selected.scaleTo(new THREE.Vector3(0.8, 0.8, 0.8), 0.05)
         selected.material.color.setRGB(2, 2, 2);

         this.selector_cube.material.color.setRGB(2, 0.5, 2);

         this.selected = true;
         this.finalAnimation = 0;
      },

      key_DOWN: function() {
         this.selection = (this.selection + 1) % this.menu_items.length;
      },

      key_UP: function() {
         if (--this.selection < 0)
            this.selection += this.menu_items.length;
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);

         this.title.update(dt);
         this.menu_objects.forEach(function(object) {
            object.update(dt);
         });

         this.selector.position.y = -6 - 15 * this.selection;

         this.selector_cube.float_time += 2 * dt;
         this.selector_cube.position.y = Math.cos(this.selector_cube.float_time) / 6;
         this.selector_cube.rotation.y += 0.5 * dt;

         if (this.selected) {
            if (this.finalAnimation < this.selectionAnimationTime + 0.5) {
               this.finalAnimation += dt;

               if (this.finalAnimation < this.selectionAnimationTime) {
                  this.selector_cube.rotation.y += (10 + 10 * Math.sin(Math.PI * this.finalAnimation / this.selectionAnimationTime)) * dt;
                  this.selector_cube.position.y = Math.sin(Math.PI * this.finalAnimation / this.selectionAnimationTime);
               }
            }
            else {
               Juicy.Game.setState(new ActiveGame(GAME_WIDTH, GAME_HEIGHT));
            }
         }
      },
   });
})();