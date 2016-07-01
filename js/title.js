/* 
 * Title screen
 */
Title = (function() {
   var orthoScale = 80;
   var delayAddOnInput = 4;
   var tick = 0;
   var inputDelay = {};

   // options passed during each spawned
   options = {
      position: new THREE.Vector3(),
      positionRandomness: .2,
      velocity: new THREE.Vector3(0., .05, 0.),
      velocityRandomness: .2,
      color: 0xaa88ff,
      colorRandomness: .2,
      turbulence: 0,
      lifetime: 2,
      size: 8,
      sizeRandomness: 1
   };

   return Juicy.State.extend({
      constructor: function(width, height) {
         this.scene = new THREE.Scene();

         this.width = width;
         this.height = height;

         // Create random particle system first
         this.particleSystem = new THREE.GPUParticleSystem({
            maxParticles: 250000
         });
         this.scene.add(this.particleSystem);

         // Lighting
         var ambientLight = new THREE.AmbientLight(0x606060);
         this.scene.add(ambientLight);

         var directionalLight = new THREE.DirectionalLight(0xffffff);
             directionalLight.position.set(1, 0.75, 0.5).normalize();
         this.scene.add(directionalLight);

         // Create the objects
         this.core = new THREE.Object3D();
         this.scene.add(this.core);

         this.coreRotation = 0;
         this.rotationSpeed = 10;

         this.fallTimer = 0;
         this.fallDelay = 70;

         this.level = 1;
         this.score = 0;
         this.linesRemoved = 0;

         this.levelDiv = document.getElementById('level');
         this.scoreDiv = document.getElementById('score');

         // Base for the game
         this.floor = new Cube.LayeredGroup();
         this.floor.position.y = -7;
         this.core.add(this.floor);

         this.floor_width = this.depth = 11;

         // Create The base
         for (var i = 0; i < this.floor_width; i ++) {
            for (var j = 0; j < this.depth; j ++) {
               this.floor.addCube(i - (this.floor_width - 1) / 2, 0, j - (this.depth - 1) / 2);
            }
         }

         this.newThing = new Cube.Group(0xff0000);
         this.scene.add(this.newThing);

         this.pieceFactory = new PieceFactory();
         this.newPiece();

         // Camera
         console.log(width, height, orthoScale)
         this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
         this.camera = new THREE.OrthographicCamera(-width / orthoScale, 
                                                     width / orthoScale, 
                                                     height / orthoScale, 
                                                    -height / orthoScale, -500, 1000);
         this.camera.position.y = 0;
         this.camera.position.z = 100;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // Backup (so you can press Shift and save a piece for later)
         this.backup = null;
         this.hasUsedBackup = false;
      },

      nextLevel: function() {
         this.levelDiv.innerHTML = '' + (++this.level);
      },

      addScore: function(score) {
         this.score += score;
         this.scoreDiv.innerHTML = '' + this.score;
      },

      newPiece: function() {
         this.pieceFactory.createRandom(this.newThing);

         this.newThing.position.x = 0;
         this.newThing.position.y = 8;
         this.newThing.position.z = 5;

         this.hasUsedBackup = false;
      },

      fall: function() {
         this.newThing.position.y --;
         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;

            var y_min = this.newThing.position.y + this.newThing.min.y;
            var y_max = this.newThing.position.y + this.newThing.max.y;
            this.floor.absorb(this.newThing, this.coreRotation);
            
            var linesRemoved = 0;

            // Check each level
            for (var y = y_min; y <= y_max; y ++) {
               var solid = true;

               for (var x = -5; x <= 5 && solid; x ++) {
                  solid = this.floor.hasCubeAt(x, y, this.coreRotation);
               }

               if (solid) {
                  linesRemoved ++;
                  this.removeRow(y--);

                  if ((++this.linesRemoved) % 4 === 0) {
                     this.nextLevel();

                     if (this.fallDelay > 6) {
                        this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
                     }
                  }
               }
            }

            this.addScore(Math.ceil(Math.pow(linesRemoved, 3/2)) * 10);

            this.coreRotation += Math.PI / 2;

            this.newPiece();

            return true;
         }

         return false;
      },

      wouldCollide: function() {
         this.newThing.position.y ++;

         var collide = this.newThing.intersects(this.floor, this.coreRotation);

         this.newThing.position.y --;

         return collide;
      },

      move: function(dx) {
         this.newThing.position.x += dx;

         if (this.wouldCollide()) {
            this.fallTimer = this.fallDelay;
         }
         else {
            this.fallTimer += delayAddOnInput;
         }

         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.x -= dx;
         }

         if (this.newThing.position.x + this.newThing.min.x < -5) {
            this.newThing.position.x = -5 - this.newThing.min.x; 
         }

         if (this.newThing.position.x + this.newThing.max.x > 5) {
            this.newThing.position.x = 5 - this.newThing.max.x; 
         }
      },

      moveLeft: function() {
         this.move(-1);
      },

      moveRight: function() {
         this.move(1);

         this.fallTimer += delayAddOnInput;
      },

      rotateLeft: function() {
         this.newThing.rotate(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
         
         this.fallTimer += delayAddOnInput;

         while (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;
         }
      },

      rotateRight: function() {
         this.newThing.rotate(new THREE.Vector3(0, 0, 1), Math.PI / 2);
         
         this.fallTimer += delayAddOnInput;

         while (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;
         }
      },

      testInput: function(game, key, ifPressed) {
         if (!inputDelay[key]) inputDelay[key] = 0;

         if (inputDelay[key]-- <= 0) {
            if (game.keyDown(key)) {
               ifPressed.call(this);
               inputDelay[key] = 8;
            }
         }
         if (!game.keyDown(key)) {
            inputDelay[key] = 0;
         }
      },

      removeRow: function(y) {
         // Remove the actual row
         this.floor.removeRow(y);

         options.position.y = y;
         var granularity = 0.01;

         options.position.z = Math.floor(this.depth / 2);
         options.velocity.x = 0;
         options.velocity.z = 5;
         for (var x = 0; x < this.floor_width; x += granularity) {
            options.position.x = x - Math.floor(this.floor_width / 2);
            this.particleSystem.spawnParticle(options);
         }

         options.position.z *= -1;
         options.velocity.z *= -1;
         for (var x = 0; x < this.floor_width; x += granularity) {
            options.position.x = x - Math.floor(this.floor_width / 2);
            this.particleSystem.spawnParticle(options);
         }

         // And the other side now
         options.position.x = Math.floor(this.floor_width / 2);
         options.velocity.x = -options.velocity.z;
         options.velocity.z = 0.;
         for (var z = 0; z < this.depth; z += granularity) {
            options.position.z = z - Math.floor(this.depth / 2);
            this.particleSystem.spawnParticle(options);
         }

         options.position.x *= -1;
         options.velocity.x *= -1;
         for (var z = 0; z < this.depth; z += granularity) {
            options.position.z = z - Math.floor(this.depth / 2);
            this.particleSystem.spawnParticle(options);
         }
      },

      onESC: function() {
         this.paused = !this.paused;

         if (this.paused) {
            this.camera = new THREE.PerspectiveCamera(28, this.width / this.height, 0.1, 1000);
            this.camera.position.y = 5;
            this.camera.position.z = 40;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
         }
         else {
            this.camera = new THREE.OrthographicCamera(-this.width / orthoScale, 
                                                        this.width / orthoScale, 
                                                        this.height / orthoScale, 
                                                       -this.height / orthoScale, -500, 1000);
            this.camera.position.y = 0;
            this.camera.position.z = 20;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
         }
      },

      onSPACE: function() {
         while (!this.fall())
            ;
      },

      onSHIFT: function() {
         if (!game.hasUsedBackup) {
            var backup = this.backup;
            this.backup = this.newThing;

            if (backup) {
               this.newThing = backup;
               this.newThing.position.x = 0;
               this.newThing.position.y = 8;
               this.newThing.position.z = 5;
            }
            else {
               this.newThing = new Cube.Group(0xff0000);
               this.newPiece();
            }

            this.scene.add(this.newThing);
            this.scene.remove(this.backup);

            game.hasUsedBackup = true;
         }
      },

      update: function(dt, game) {
         tick += dt;
         if (tick < 0) tick = 0;

         this.particleSystem.update(tick);

         this.floor.update(dt);

         if (this.paused) return;

         if (this.core.rotation.y !== this.coreRotation) {
            var dist = this.rotationSpeed * Math.min(this.coreRotation - this.core.rotation.y, 1);

            this.core.rotation.y += dist * dt;

            if (Math.abs(this.coreRotation - this.core.rotation.y) < 0.01) {
               this.core.rotation.y = this.coreRotation;
            }
         }

         this.testInput(game, 'LEFT', this.moveLeft);
         this.testInput(game, 'RIGHT', this.moveRight);
         this.testInput(game, 'UP', this.rotateLeft);

         if (Input.getKey('DOWN')) {
            this.fallTimer -= 5;
         }

         if (this.fallTimer-- <= 0) {
            if (!this.wouldCollide() || this.fallTimer <= -6) {
               this.fallTimer = this.fallDelay;
               
               this.fall();
            }
         }
      },

      render: function(renderer) {
         renderer.render(this.scene, this.camera);
      }
   });
})();