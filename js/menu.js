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
         Screen2D.apply(this, arguments);

         var self = this;
         window.game = this;

         this.titleStart = 70;
         this.titleDest = 170;
         this.menuItemSpacing = 100;

         // Create the objects
         this.title = new ThreeImage('title_rendered.png');
         this.title.position.y = this.titleStart;
         this.scene.add(this.title);

         this.press_space = new ThreeImage('press_space_rendered.png');
         this.press_space.position.y = -120;
         this.scene.add(this.press_space);

         this.menu_items = ['classic', 'infinite', 'credits'];

         this.menu_objects = this.menu_items.map(function(string, index) {
            var menu_object = new ThreeImage(string + '.png');//SpecialCube.Group.FromString(string);

            menu_object.position.x = 150;
            menu_object.position.y = -10 - index * self.menuItemSpacing;
            menu_object.material.opacity = 0;

            menu_object.update(0);

            return menu_object;
         });

         this.sub_classic_objects = ['intro', 'skip'].map(function(string, index) {
            var menu_object = new ThreeImage(string + '.png');
            menu_object.material.opacity = 0;

            menu_object.update(0);

            return menu_object;
         });

         this.state = 'title';

         this.selector = new Cube.Group();
         this.selector.addCube(0, 0, 0);
         this.selector.material.color = new THREE.Color(1, 0, 1);
         this.selector.scale.setScalar(25);
         this.selector.position.x = -120;
         this.selector.position.y = -6;
         this.scene.add(this.selector);

         this.selector_cube = this.selector.children[0];
         this.selector_cube.rotation.y = Math.PI / 4;
         this.selector_cube.rotation.x = Math.PI / 8;
         this.selector_cube.float_time = 0;
         this.selector_cube.material.transparent = true;
         this.selector_cube.material.opacity = 0;

         this.selection = 0;
         this.selectionAnimationTime = 0.75;
      },

      showSelected: function(menu_object) {
         Juicy.Sound.play('select');

         menu_object.material.color.setRGB(2, 2, 2);

         this.selector_cube.material.color.setRGB(2, 0.5, 2);

         this.selected = true;
         this.finalAnimation = 0;
      },

      key_SPACE: function() {
         var self = this;
         if (this.state === 'title') {
            this.title.moveTo(new THREE.Vector3(0, this.titleDest, 0), 1);
            this.press_space.moveTo(this.press_space.position.clone().add(new THREE.Vector3(0, 50, 0)));
            this.press_space.fadeTo(0, 0.5, function() {
               self.state = 'menu';

               for (var i = 0; i < self.menu_objects.length; i ++) {
                  setTimeout((function(i) {
                     return function() {
                        self.scene.add(self.menu_objects[i]);
                        self.menu_objects[i].fadeTo(1, 0.6);
                        self.menu_objects[i].moveTo(new THREE.Vector3(100, -5 - i * self.menuItemSpacing, 0), 0.6);
                     }
                  })(i), i * 300);
               }
            });
         }
         else if (this.state === 'menu') {
            this.menu_objects.forEach(function(object, index) {
               if (index !== self.selection) {
                  self.scene.remove(object);
               }
            });

            // Classic has a sub menu
            if (this.selection === 0) {
               this.sub_classic_objects.forEach(function(object, index) {
                  self.scene.add(object);

                  object.position.copy(self.menu_objects[0].position);
                  object.material.opacity = 1;
               });

               this.state === 'submenu';
            }
            else {
               this.showSelected(this.menu_objects[this.selection]);
            }
         }
         else if (this.state === 'submenu') {
            this.sub_classic_objects.forEach(function(object, index) {
               if (index !== self.selection) {
                  self.scene.remove(object);
               }
            });

            this.showSelected(this.sub_classic_objects[this.selection]);
         }
      },

      key_down_DOWN: function() {
         this.selection = (this.selection + 1) % this.menu_items.length;
      },

      key_down_UP: function() {
         if (--this.selection < 0)
            this.selection += this.menu_items.length;
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);

         this.title.update(dt);

         this.press_space.update(dt);
         if (this.state !== 'title') {
            if (this.selector_cube.material.opacity < 1) {
               this.selector_cube.material.opacity += dt;

               if (this.selector_cube.material.opacity > 1) {
                  this.selector_cube.material.opacity = 1;
               }
            }
            this.menu_objects.forEach(function(object) {
               object.update(dt);
            });

            this.selector.position.y = -6 - this.menuItemSpacing * this.selection;

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
         }
      },
   });
})();