/* 
 * Intro Game screen
 * aka not not classic
 */
IntroGame = (function() {
   return Juicy.State.extend({
      constructor: function(width, height) {
         var self = this;

         window.intro = this;

         this.width = width;
         this.height = height;

         this.stupidDelay = 0;

         this.scene = new THREE.Object3D();
         this.scene.position.z = 200;

         // Game
         this.active_game = new ClassicGame(width, height);

         // Dialog for communicating
         this.dialogBox = new Cube.Group();
         this.dialogBox.scale.set(10, 10, 1);
         this.scene.add(this.dialogBox);

         this.dialogBoxAnimTick = 0;
         this.cubeMoveTime = 0.25;
         this.cubeMoveInterval = 0.01;

         this.text = new Cube.Group();
         this.text.material.transparent = true;
         this.text.scale.setScalar(3);

         this.dialogBoxAnimTime = 0.5;
         this.dialogBoxTextTick = 0;
         this.dialogBoxTextTime = 0.3;

         this.active_game.hudScene.add(this.scene);

         this.press_space = new ThreeImage('press_space.png');
         this.scene.add(this.press_space);
         this.press_space.material.opacity = 0;

         this.doneAnimating = true;
         this.dialogIndex = 0;
         this.advanceDialog();
         this.onCloseDialog();
         this.expanding = true;

         this.updateGame = false;
      },

      dialog: [
         'Welcome to threetris!',
         [
            'Threetris takes a classic',
            'arcade game, and brings it',
            'into the third dimension.'
         ],
         [
            'What do I mean?',
            '',
            'Watch this!'
         ],
         function() {
            var self = this;

            var timer = 0;
            var blockPlaced = false;
            this.updateGame = function(dt, game) {
               if (blockPlaced) {
                  this.active_game.update(dt, game);
               }
               else {
                  timer -= dt;
                  if (!blockPlaced && timer < 0) {
                     this.active_game.fall();
                     timer = 0.1;
                  }
               }
            };

            this.expanding = false;
            this.press_space.material.opacity = 0;

            this.active_game.inputEnabled = false;

            this.onCloseDialog = function() {
               this.doneAnimating = false;
            }

            this.active_game.onBlockPlaced = function() {
               blockPlaced = true;

               this.onBlockPlaced = function() {};
            }

            this.active_game.onFinishRotation = function() {
               self.doneAnimating = true;
               self.advanceDialog();
               self.onCloseDialog();
               self.expanding = true;

               self.updateGame = false;

               this.onFinishRotation = function() {};
            };
         },
         'Woah! What happened?',
         'Check it out:',
         function() {
            var self = this;
            var active_game = this.active_game;

            active_game.hudScene.remove(active_game.hudLevel);
            active_game.hudScene.remove(active_game.hudGoal);
            active_game.hudScene.remove(active_game.hudImage);
            active_game.previews.forEach(function(preview) {
               self.active_game.hudScene.remove(preview);
            });

            this.expanding = false;
            this.press_space.material.opacity = 0;

            this.onCloseDialog = function() {
               this.doneAnimating = false;
            }

            var blockPlaced = false;
            this.updateGame = function(dt) {
               if (active_game.container.rotation.x < Math.PI / 8) {
                  active_game.container.rotation.x = Math.min(
                     active_game.container.rotation.x + dt / 3,
                     Math.PI / 8
                  );
               }
               else {
                  var timer = 0;
                  self.updateGame = function(dt, game) {
                     if (blockPlaced) {
                        this.active_game.update(dt, game);
                     }
                     else {
                        timer -= dt;
                        if (!blockPlaced && timer < 0) {
                           this.active_game.fall();
                           timer = 0.1;
                        }
                     }
                  };
               }
            }

            this.active_game.onBlockPlaced = function() {
               blockPlaced = true;

               this.onBlockPlaced = function() {};
            }

            this.active_game.onFinishRotation = function() {
               self.doneAnimating = true;
               self.advanceDialog();
               self.onCloseDialog();
               self.expanding = true;
               self.updateGame = false;

               this.onFinishRotation = function() {};
            };
         },
         [
            'Youre actually playing on',
            'a 3D platform!'
         ],
         function() {
            var self = this;
            var active_game = this.active_game;

            self.updateGame = function(dt) {
               if (active_game.container.rotation.x > 0) {
                  active_game.container.rotation.x = Math.max(active_game.container.rotation.x - dt / 3, 0);
               }
               else {
                  active_game.hudScene.add(active_game.hudLevel);
                  active_game.hudScene.add(active_game.hudGoal);
                  active_game.hudScene.add(active_game.hudImage);
                  active_game.previews.forEach(function(preview) {
                     self.active_game.hudScene.add(preview);
                  });

                  self.advanceDialog();
                  self.onCloseDialog();
                  self.expanding = true;
                  self.updateGame = false;
               }
            }

            this.expanding = false;
            this.press_space.material.opacity = 0;

            this.onCloseDialog = function() {
               this.doneAnimating = false;
            }
         },
         [
            'However, pieces fall as if',
            'you are in 2 dimensions.'
         ],
         [
            'Whenever you place a tile,',
            'the platform will rotate.'
         ],
         [
            'Clear a row on one side to',
            'remove it across the whole',
            'platform!'
         ],
         [
            'Now, enough talking.',
            'Good luck!'
         ],
         function() {
            this.expanding = false;
            this.active_game.inputEnabled = true;

            this.onCloseDialog = function() {
               Juicy.Game.setState(this.active_game);
            }
         }
      ],

      advanceDialog: function() {
         var next = this.dialog[this.dialogIndex];

         if (typeof(next) === 'string' || next instanceof Array) {
            this.say(next);
         }
         else {
            next.apply(this);
         }

         this.dialogIndex ++;
      },

      key_SPACE: function() {
         if (!this.doneAnimating)
            return;

         this.advanceDialog();
      },

      say: function(strings) {
         var self = this;

         this.doneAnimating = false;

         if (typeof(strings) === 'string') {
            strings = [strings];
         }

         var len = 0;
         strings.forEach(function(string) { if (string.length > len) len = string.length; });

         this.press_space.material.opacity = 0;
         this.expanding = false;
         this.onCloseDialog = function() {
            this.cubes = [];
            this.cubesByX = [];
            this.ready = false;
            this.expanding = true;
            this.press_space.material.opacity = 0;
            strings.forEach(function(string, strind) {
               SpecialCube.Group.GetCubesForString(string, function(cubes) {
                  // self.cubes.concat(cubes);
                  self.ready = true;

                  cubes.forEach(function(cube) {
                     cube.position.y -= (2 * strind + 1 - strings.length) * 7;

                     self.cubesByX[cube.position.x] = self.cubesByX[cube.position.x] || [];
                     self.cubesByX[cube.position.x].push(cube);
                  });
               });
            });
            this.text.material.opacity = 1;
            this.text.position.x = -len * 14/4 * this.text.scale.x;
            this.scene.add(this.text);

            this.initDialogBox(Math.min(Math.floor(len * 9/4) + 6, 64), 8 + 4 * strings.length);

            this.dialogBoxTextTick = 0;
            this.dialogBoxAnimTick = 0;
         }
      },

      initDialogBox: function(width, height) {
         this.dialogBox.clear();
         this.backdrop = this.dialogBox.addCube(0, 0, 0, 0x000000);
         this.backdrop.scale.y = 1;
         this.backdrop.scale.x = 1;
         this.backdrop.position.set(0, 0, -1);
         this.backdrop.material.map = null;

         for (var i = this.dialogBox.children.length - 1; i < width * 2 + height * 2; i ++) {
            this.dialogBox.addCube(100, 0, 0);
         }

         this.dialog_w = width;
         this.dialog_h = height;
      },

      animateDialogText: function(dt) {
         var self = this;

         if (this.dialogBoxTextTick < this.dialogBoxTextTime) {
            var last_percent = this.dialogBoxTextTick / this.dialogBoxTextTime;

            this.dialogBoxTextTick = Math.min(this.dialogBoxTextTick + dt, this.dialogBoxTextTime);

            var percent = this.dialogBoxTextTick / this.dialogBoxTextTime;

            // Text animation
            var textSpeed = 1.2;
            var textStart = Math.floor(((1 - textSpeed) + textSpeed * last_percent) * this.cubesByX.length);
            var textEnd   = Math.floor(((1 - textSpeed) + textSpeed * percent) * this.cubesByX.length);
            for (var i = textStart; i <= textEnd; i ++) {
               var list = this.cubesByX[i];
               this.cubesByX[i] = false;

               if (list) {
                  list.forEach(function(cube) {
                     self.text.addCube(cube);
                     cube.material = self.text.material;
                  })
               }
            }

            if (percent === 1) {
               this.press_space.material.opacity = 1;
               this.press_space.position.set(
                  this.dialog_w * 10 / 2 - this.press_space.material.map.image.width / 2 - 8,
                 -this.dialog_h * 10 / 2 + this.press_space.material.map.image.height,
                  1
               );

               this.doneAnimating = true;
            }
         }
      },

      getDialogBoxCubePos: function(index) {
         // top
         if (index <= this.dialog_w) {
            return {
               y: this.dialog_h / 2,
               x: -this.dialog_w / 2 + index
            };
         }
         // right
         else if (index < this.dialog_w + this.dialog_h) {
            return {
               x: this.dialog_w / 2,
               y: this.dialog_h / 2 - (index - this.dialog_w)
            };
         }
         // bot
         else if (index < 2 * this.dialog_w + this.dialog_h) {
            return {
               y: -this.dialog_h / 2,
               x:  this.dialog_w / 2 - (index - this.dialog_w - this.dialog_h)
            };
         }
         // left
         else {
            return {
               x: -this.dialog_w / 2,
               y: -this.dialog_h / 2 + (index - 2 * this.dialog_w - this.dialog_h)
            };
         }
      },

      animateDialogBox: function(dt) {
         var self = this;

         if ((this.expanding && this.dialogBoxAnimTick < this.dialogBoxAnimTime) ||
             (!this.expanding && this.dialogBoxAnimTick > 0)) {
            this.dialogBoxAnimTick += (this.expanding ? 1 : -1) * dt;
            if (this.dialogBoxAnimTick > this.dialogBoxAnimTime)
               this.dialogBoxAnimTick = this.dialogBoxAnimTime;
            if (this.dialogBoxAnimTick < 0)
               this.dialogBoxAnimTick = 0;

            // Animate out brackets first
            var percent  = this.dialogBoxAnimTick / this.dialogBoxAnimTime;
            var dist_x   = this.dialog_w / 2;
            var dist_y   = this.dialog_h / 2;
            var extent_x = dist_x * Math.min(percent, 0.5);
            var extent_y = dist_y * 2 * Math.max(percent - 0.5, 0);

            this.backdrop.scale.x = Math.max(4 * extent_x, 1);
            this.backdrop.scale.y = Math.max(Math.min(4 * extent_y, this.dialog_h), 1);

            // Expand the line first
            this.dialogBox.children.forEach(function(child, index) {
               // ignore backdrop
               if (index === 0) return;

               var dest = self.getDialogBoxCubePos(index - 1);

               if (Math.abs(dest.x) <= extent_x * 2) {
                  child.position.x = dest.x;
               }
               else {
                  child.position.x = 100;
               }

               if (Math.abs(dest.y) <= extent_y * 2) {
                  child.position.y = dest.y;
               }
               else {
                  child.position.y = Math.sign(dest.y) * extent_y * 2;
               }
            });

            if (!this.expanding) {
               this.text.material.opacity = percent;

               if (percent < 0.5 && this.text.children.length) {
                  this.text.clear();
               }
               if (percent === 0) {
                  var callback = this.onCloseDialog;
                  this.onCloseDialog = function() {};
                  callback.call(this);
               }
            }
         }
         else {
            this.animateDialogText(dt);
         }
      },

      update: function(dt, game) {
         this.stupidDelay -= dt;
         if (!this.ready || this.stupidDelay > 0) return;

         this.animateDialogBox(dt);

         if (this.updateGame) 
            this.updateGame(dt, game);
      },

      render: function(renderer) {
         renderer.render(this.active_game.hudScene, this.active_game.camera);
         // renderer.render(this.scene, this.camera);
      }
   });
})();