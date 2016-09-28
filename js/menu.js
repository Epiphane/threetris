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

         this.ControlsState = new Controls(GAME_WIDTH, GAME_HEIGHT, this);

         this.titleStart = 70;
         this.titleDest = 170;
         this.menuItemSpacing = 100;

         this.PSA = new ThreeImage('PSA.png');
         this.PSA.position.y = -300;
         this.scene.add(this.PSA);

         // Create the objects
         this.title = new ThreeImage('title_rendered.png');
         this.title.position.y = this.titleStart;
         this.scene.add(this.title);

         this.press_space = new ThreeImage('press_space_rendered.png');
         this.press_space.position.y = -120;
         this.scene.add(this.press_space);

         this.menu_items = ['classic', 'how_to_play', 'high_scores'];

         this.menu_objects = this.base_menu_objects = this.menu_items.map(function(string, index) {
            var menu_object = new ThreeImage(string + '.png');//SpecialCube.Group.FromString(string);

            menu_object.position.x = 150;
            menu_object.position.y = -10 - index * self.menuItemSpacing;
            menu_object.material.opacity = 0;

            menu_object.update(0);

            return menu_object;
         });

         this.sub_classic_objects = ['intro', 'skip', 'back'].map(function(string, index) {
            var menu_object = new ThreeImage(string + '.png');
            menu_object.material.opacity = 0;

            menu_object.update(0);

            menu_object.position.copy(self.base_menu_objects[0].position);
            menu_object.position.x -= 80;
            menu_object.material.opacity = 0;

            return menu_object;
         });

         this.state = 'title';

         this.selector = new Cube.Group();
         this.selector.addCube(0, 0, 0);
         this.selector.material.color = new THREE.Color(1, 0, 1);
         this.selector.scale.setScalar(25);
         this.selector.position.x = -160;
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

         if (this.state === 'submenu')
            this.selector_cube.material.color.setRGB(2, 2, 0.5);
         else
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
                  self.scene.add(self.menu_objects[i]);
                  (function(i, obj) {
                     return function() {
                        obj.material.opacity = -0.3 * i;
                        obj.fadeTo(1, 0.6 + 0.3 * i);
                        obj.moveTo(new THREE.Vector3(100, -5 - i * self.menuItemSpacing, 0), 0.6 + 0.3 * i);
                     }
                  })(i, self.menu_objects[i])();
               }
            });
         }
         else if (this.state === 'menu') {
            this.menu_objects.forEach(function(object, index) {
               if (index !== self.selection) {
                  object.lerpDest.opacity = 0;
                  object.material.opacity = 0;
               }
            });

            // Classic has a sub menu
            if (this.selection === 0) {
               // Change the menu itself heheh
               var rootObj = this.menu_objects[0];
               this.menu_objects = this.sub_classic_objects;
               
               this.sub_classic_objects.forEach(function(object, index) {
                  self.scene.add(object);

                  index ++;
                  var moveTime = 0.125;
                  object.moveTo(rootObj.position.clone().add(new THREE.Vector3(-30, -index * 60 - 20, 0)), index * moveTime);
                  object.fadeTo(1, index * moveTime);
               });

               this.menuItemSpacing = 60;
               this.selector.position.x += 100;
               this.selector_cube.material.color.setRGB(0.5, 1, 0);

               this.state = 'submenu';
            }
            else {
               // Infinite
               if (this.selection === 1) {
                  this.menu_objects.forEach(function(object, index) {
                     object.lerpDest.opacity = 1;
                     object.material.opacity = 1;
                  });

                  this.selection = 0;
                  Juicy.Game.setState(this.ControlsState);
               }
               // Controls
               else {
                  this.nextState = new Score(GAME_WIDTH, GAME_HEIGHT, 'classic');
                  this.showSelected(this.menu_objects[this.selection]);
               }
            }
         }
         else if (this.state === 'submenu') {
            // Back
            if (this.selection === 2) {
               this.state = 'menu';
               
               this.menuItemSpacing = 100;
               this.selector.position.x -= 100;
               this.selector_cube.material.color.setRGB(1, 0, 1);
               this.selection = 0;

               for (var i = 0; i < this.menu_objects.length; i ++) {
                  this.menu_objects[i].material.opacity = 0;
               }

               this.menu_objects = this.base_menu_objects
               for (var i = 0; i < this.menu_objects.length; i ++) {
                  this.menu_objects[i].material.opacity = 1;
                  this.menu_objects[i].position.set(100, -5 - i * this.menuItemSpacing, 0);
               }
            }
            else {
               this.sub_classic_objects.forEach(function(object, index) {
                  if (index !== self.selection) {
                     self.scene.remove(object);
                  }
               });

               // Intro
               if (this.selection === 0) {
                  this.nextState = new IntroGame(GAME_WIDTH, GAME_HEIGHT);

                  __em.startGame('intro');
               }
               // Skip
               else {
                  this.nextState = new ClassicGame(GAME_WIDTH, GAME_HEIGHT);

                  __em.startGame('classic');
               }
               this.showSelected(this.sub_classic_objects[this.selection]);
            }
         }
      },

      key_down_DOWN: function() {
         if (this.state !== 'menu' && this.state !== 'submenu')
            return;

         this.selection = (this.selection + 1) % this.menu_objects.length;
      },

      key_down_UP: function() {
         if (this.state !== 'menu' && this.state !== 'submenu')
            return;

         if (--this.selection < 0)
            this.selection += this.menu_objects.length;
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
            this.sub_classic_objects.forEach(function(object) {
               object.update(dt);
            });
            this.base_menu_objects.forEach(function(object) {
               object.update(dt);
            });

            this.selector.position.y = -6 - this.menuItemSpacing * this.selection;
            if (this.state === 'submenu') {
               this.selector.position.y -= 80;
            }

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
                  Juicy.Game.setState(this.nextState);
               }
            }
         }
      },
   });
})();