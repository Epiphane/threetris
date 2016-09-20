/* 
 * Intro Game screen
 * aka not not classic
 */
IntroGame = (function() {
   return Juicy.State.extend({
      constructor: function(width, height) {
         this.width = width;
         this.height = height;

         this.stupidDelay = 1;

         this.scene = new THREE.Scene();

         this.camera = new THREE.OrthographicCamera(-this.width / 2, 
                                                     this.width / 2, 
                                                     this.height / 2, 
                                                    -this.height / 2, -500, 1000);
         this.camera.position.y = 0;
         this.camera.position.z = 100;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // Lighting
         var ambientLight = new THREE.AmbientLight(0x606060);
         this.scene.add(ambientLight);

         var directionalLight = new THREE.DirectionalLight(0xffffff);
             directionalLight.position.set(1, 0.75, 0.5).normalize();
         this.scene.add(directionalLight);

         // Game
         this.active_game = new ClassicGame(width, height);

         // Dialog for communicating
         this.dialogBox = new Cube.Group();
         this.dialogBox.scale.set(10, 10, 1);
         this.scene.add(this.dialogBox);

         this.dialogBoxAnimTick = 0;
         this.cubeMoveTime = 0.25;
         this.cubeMoveInterval = 0.01;
         this.initDialogBox(50, 16);

         window.intro = this;

         this.text = new Cube.Group();
         this.text.scale.setScalar(5);
         this.scene.add(this.text);

         SpecialCube.Group.AddLetter(this.text, 'H', 0, 0);
      },

      initDialogBox: function(width, height) {
         this.dialogBox.clear();
         for (var i = 0; i < 12 + height * 2; i ++) {
            this.dialogBox.addCube(100, 0, 0);
         }
         this.dialogBoxAnimTick = 0;

         this.dialog_w = width;
         this.dialog_h = height;
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
         this.dialogBoxAnimTick += dt;

         if (this.dialogBoxAnimTick < 0.5) {
            // Animate out brackets first
            var percent = this.dialogBoxAnimTick * 2;
            var dist    = this.dialog_w / 2;
            var extent  = dist * percent;

            var index = 0;

            // Bracket bars
            for (var i = 0; i < this.dialog_h; i ++) {
               var left  = this.dialogBox.children[index++];
               var right = this.dialogBox.children[index++];
               left.position.y = this.dialog_h / 2 - i;
               right.position.y = this.dialog_h / 2 - i;

               left.position.x = -extent;
               right.position.x = extent;
            }

            // Bracket edge
            for (var i = 0; i < extent && i < 3; i ++) {
               var tl = this.dialogBox.children[index++];
               var tr = this.dialogBox.children[index++];
               var bl = this.dialogBox.children[index++];
               var br = this.dialogBox.children[index++];

               tl.position.y =  this.dialog_h / 2;
               tr.position.y =  this.dialog_h / 2;
               bl.position.y = -this.dialog_h / 2 + 1;
               br.position.y = -this.dialog_h / 2 + 1;

               var myDist = extent - (i + 1);
               tl.position.x = -myDist;
               bl.position.x = -myDist;
               tr.position.x =  myDist;
               br.position.x =  myDist;
            }
         }

         return;

         var minCube = Math.floor((this.dialogBoxAnimTick - this.cubeMoveTime) / this.cubeMoveInterval);
         var maxCube = minCube + this.cubeMoveTime / this.cubeMoveInterval;

         for (var i = minCube - 1; i <= maxCube + 1; i ++) {
            if (i < 0) continue;
            if (i >= this.dialogBox.children.length) break;

            var startMove = i * this.cubeMoveInterval;
            var endMove   = startMove + this.cubeMoveTime;
            var percent   = (this.dialogBoxAnimTick - startMove) / this.cubeMoveTime;
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;

            var pos = this.getDialogBoxCubePos(i);

            this.dialogBox.children[i].position.set(pos.x * percent, pos.y * percent, 0);
         }
      },

      update: function(dt, game) {
         this.stupidDelay -= dt;
         if (this.stupidDelay > 0) return;

         this.animateDialogBox(dt);
      },

      render: function(renderer) {
         renderer.render(this.active_game.hudScene, this.active_game.camera);
         renderer.render(this.scene, this.camera);
      }
   });
})();