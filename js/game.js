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

      this.currentPiece = 0;
      this.pieces = [
         [[0, 0, 0],[]] 
      ];

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

      this.newThing.addCube(0, 0, 0);
      this.newThing.addCube(1, 0, 0);
      this.newThing.addCube(1, 1, 0);
      this.newThing.addCube(-1, 0, 0);

      this.newThing.position.x = 0;
      this.newThing.position.y = 8;
      this.newThing.position.z = 5;
   };

   Game.prototype.fall = function() {
      this.newThing.position.y --;
      if (this.newThing.intersects(this.floor, this.coreRotation)) {
         this.newThing.position.y ++;

         this.floor.absorb(this.newThing, this.coreRotation);
         this.coreRotation += Math.PI / 2;

         this.newPiece();
      }
   };

   Game.prototype.move = function(dx) {
      this.newThing.position.x += dx;

      if (this.newThing.intersects(this.floor, this.coreRotation)) {
         this.newThing.position.x -= dx;
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
            inputDelay[key] = 15;
         }
      }
   };

   var paused = false, pPress = false;
   var fallDelay = 0;
   Game.prototype.update = function(dt) {
      if (Input.getKey('SPACE')) {
         if (!pPress) paused = !paused;

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
      this.testInput('A', this.rotateLeft);
      this.testInput('D', this.rotateRight);

      if (Input.getKey('DOWN')) {
         fallDelay -= 5;
      }

      if (fallDelay-- <= 0) {
         fallDelay = 50;
         
         this.fall();
      }
   };

   Game.prototype.render = function(renderer) {
      renderer.render(this.scene, this.camera);
   };

   return Game;
})();