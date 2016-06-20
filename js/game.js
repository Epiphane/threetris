/* 
 * Main game logic. 
 * 
 * new Game() will create...a new game.
 */
Game = (function() {
   var Game = function(renderer) {
      this.scene = new THREE.Scene();

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

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
      this.floor.position.y = -5;
      this.core.add(this.floor);

      this.width = this.depth = 11;

      // Create The base
      for (var i = 0; i < this.width; i ++) {
         for (var j = 0; j < this.depth; j ++) {
            this.floor.addCube(i - (this.width - 1) / 2, 0, j - (this.depth - 1) / 2);
         }
      }

      this.newThing = new Cube.Group(0xff0000);
      this.scene.add(this.newThing);

      this.pieceFactory = new PieceFactory();
      this.newPiece();

      // Camera
      var orthoScale = 80;
      this.camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera = new THREE.OrthographicCamera(-window.innerWidth / orthoScale, window.innerWidth / orthoScale, window.innerHeight / orthoScale, -window.innerHeight / orthoScale, -500, 1000);
      this.camera.position.y = 0;
      this.camera.position.z = 100;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
   };

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
   spawnerOptions = {
      spawnRate: 15000,
      horizontalSpeed: 2.5,
      verticalSpeed: 1.33,
      timeScale: 1
   }

   var tick = 0;

   Game.prototype.nextLevel = function() {
      this.levelDiv.innerHTML = '' + (++this.level);
   };

   Game.prototype.addScore = function(score) {
      this.score += score;
      this.scoreDiv.innerHTML = '' + this.score;
   };

   Game.prototype.newPiece = function() {
      this.newThing.setColor(new THREE.Color(Math.random() * 3 / 4 + 0.25, Math.random() * 3 / 4 + 0.25, Math.random() * 3 / 4 + 0.25));

      this.pieceFactory.createRandom(this.newThing);

      this.newThing.position.x = 0;
      this.newThing.position.y = 8;
      this.newThing.position.z = 5;
   };

   Game.prototype.fall = function() {
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

               if ((++this.linesRemoved) % 6 === 0) {
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
   };

   Game.prototype.wouldCollide = function() {
      this.newThing.position.y ++;

      var collide = this.newThing.intersects(this.floor, this.coreRotation);

      this.newThing.position.y --;

      return collide;
   };

   var delayAddOnInput = 4;

   Game.prototype.move = function(dx) {
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
   }

   Game.prototype.moveLeft = function() {
      this.move(-1);
   };

   Game.prototype.moveRight = function() {
      this.move(1);

      this.fallTimer += delayAddOnInput;
   };

   Game.prototype.rotateLeft = function() {
      this.newThing.rotate(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
      
      this.fallTimer += delayAddOnInput;

      while (this.newThing.intersects(this.floor, this.coreRotation)) {
         this.newThing.position.y ++;
      }
   };

   Game.prototype.rotateRight = function() {
      this.newThing.rotate(new THREE.Vector3(0, 0, 1), Math.PI / 2);
      
      this.fallTimer += delayAddOnInput;

      while (this.newThing.intersects(this.floor, this.coreRotation)) {
         this.newThing.position.y ++;
      }
   };

   var inputDelay = {};
   Game.prototype.testInput = function(key, ifPressed) {
      if (!inputDelay[key]) inputDelay[key] = 0;

      if (inputDelay[key]-- <= 0) {
         if (Input.getKey(key)) {
            ifPressed.call(this);
            inputDelay[key] = 12;
         }
      }
      if (!Input.getKey(key)) {
         inputDelay[key] = 0;
      }
   };

   Game.prototype.removeRow = function(y) {
      // Remove the actual row
      this.floor.removeRow(y);

      options.position.y = y;
      var granularity = 0.01;

      options.position.z = Math.floor(this.depth / 2);
      options.velocity.x = 0;
      options.velocity.z = 5;
      for (var x = 0; x < this.width; x += granularity) {
         options.position.x = x - Math.floor(this.width / 2);
         this.particleSystem.spawnParticle(options);
      }

      options.position.z *= -1;
      options.velocity.z *= -1;
      for (var x = 0; x < this.width; x += granularity) {
         options.position.x = x - Math.floor(this.width / 2);
         this.particleSystem.spawnParticle(options);
      }

      // And the other side now
      options.position.x = Math.floor(this.width / 2);
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
   }

   var paused = false, pPress = false;
   var sPress = false;
   var pulseTimer = 0;
   Game.prototype.update = function(dt) {
      tick += dt * spawnerOptions.timeScale;
      if (tick < 0) tick = 0;

      this.particleSystem.update(tick);

      this.floor.update(dt);

      if (Input.getKey('ESC')) {
         if (!pPress) paused = !paused;

         if (paused) {
            this.camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.y = 5;
            this.camera.position.z = 40;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
         }
         else {
            this.camera = new THREE.OrthographicCamera(-window.innerWidth / 80, window.innerWidth / 80, window.innerHeight / 80, -window.innerHeight / 80, -500, 1000);
            this.camera.position.y = 0;
            this.camera.position.z = 20;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
         }

         pPress = true;
      }
      else {
         pPress = false;
      }

      if (paused) return;

      if (this.core.rotation.y !== this.coreRotation) {
         var dist = this.rotationSpeed * Math.min(this.coreRotation - this.core.rotation.y, 1);

         this.core.rotation.y += dist * dt;

         if (Math.abs(this.coreRotation - this.core.rotation.y) < 0.01) {
            this.core.rotation.y = this.coreRotation;
         }
      }
      else {
         // if (Input.getKey('A')) {
         //    this.coreRotation -= Math.PI / 2;
         // }
         // else if (Input.getKey('D')) {
         //    this.coreRotation += Math.PI / 2;
         // }
      }

      this.testInput('LEFT', this.moveLeft);
      this.testInput('RIGHT', this.moveRight);
      this.testInput('UP', this.rotateLeft);

      if (Input.getKey('DOWN')) {
         this.fallTimer -= 5;
      }

      if (this.fallTimer-- <= 0) {
         this.fallTimer = this.fallDelay;
         
         this.fall();
      }

      if (Input.getKey('SPACE') && !sPress) {
         while (!this.fall())
            ;
      }
      sPress = Input.getKey('SPACE');
   };

   Game.prototype.render = function(renderer) {
      renderer.render(this.scene, this.camera);
   };

   return Game;
})();