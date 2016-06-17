/* 
 * Main game logic. 
 * 
 * new Game() will create...a new game.
 */
Game = (function() {
   var Game = function(renderer) {
      this.scene = new THREE.Scene();

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

      this.fallDelay = 70;

      // Base for the game
      this.floor = new Cube.Group();
      this.floor.position.y = -5;
      this.core.add(this.floor);

      // Create The base
      for (var i = 0; i < 11; i ++) {
         for (var j = 0; j < 11; j ++) {
            this.floor.addCube(i - 5, 0, j - 5);
         }
      }

      this.newThing = new Cube.Group(0xff0000);
      this.scene.add(this.newThing);

      this.pieceFactory = new PieceFactory();
      this.newPiece();

      // Camera
      var orthoScale = 80;
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera = new THREE.OrthographicCamera(-window.innerWidth / orthoScale, window.innerWidth / orthoScale, window.innerHeight / orthoScale, -window.innerHeight / orthoScale, -500, 1000);
      this.camera.position.y = 0;
      this.camera.position.z = 20;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
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

         // Check each level
         for (var y = y_min; y <= y_max; y ++) {
            var solid = true;

            for (var x = -5; x <= 5 && solid; x ++) {
               solid = this.floor.hasCubeAt(x, y, this.coreRotation);
            }

            if (solid) {
               this.floor.removeRow(y);

               if (this.fallDelay > 6) {
                  this.fallDelay -= 2;
               }
            }
         }

         this.coreRotation += Math.PI / 2;

         this.newPiece();

         return true;
      }

      return false;
   };

   Game.prototype.move = function(dx) {
      this.newThing.position.x += dx;

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
   };

   Game.prototype.rotateLeft = function() {
      this.newThing.rotate(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
   };

   Game.prototype.rotateRight = function() {
      this.newThing.rotate(new THREE.Vector3(0, 0, 1), Math.PI / 2);
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

   var paused = false, pPress = false;
   var sPress = false;
   var fallDelay = 0;
   Game.prototype.update = function(dt) {
      if (Input.getKey('ESC')) {
         if (!pPress) paused = !paused;

         if (paused) {
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.y = 5;
            this.camera.position.z = 20;
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
         fallDelay -= 5;
      }

      if (fallDelay-- <= 0) {
         fallDelay = this.fallDelay;
         
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