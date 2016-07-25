var SpecialCube = (function() {
   var minCol = 0;
   var WHITE = new THREE.Color(minCol, minCol, minCol);

   noise.seed(0);

   var SpecialCube = function() {
      Cube.apply(this, arguments);

      this.fading = 0;
      this.fadeLength = 4;
      this.realColor = this.material.color.clone();

      var scale = 1 / 50;
      this.timer = Math.PI * (1 + noise.simplex2(this.position.x / 30, this.position.y / 50));
   };

   SpecialCube.prototype = Object.create(Cube.prototype);

   SpecialCube.prototype.setFade = function(fade) {
      fade = Math.min(fade, 0.4);

      this.material.color.setRGB(
         WHITE.r * fade + (1 - fade) * this.realColor.r,
         WHITE.g * fade + (1 - fade) * this.realColor.g,
         WHITE.b * fade + (1 - fade) * this.realColor.b
      );
   }

   var fadeSpeed = 2;
   SpecialCube.prototype.update = function(dt) {
      this.timer -= dt;

      // sin curve for fading
      var posOnCurve = 2 * Math.PI * (this.timer % fadeSpeed) / fadeSpeed;
      this.setFade(Math.cos(posOnCurve) / 2 + 0.5);

      // if (this.fading > 0) {
      //    this.fading -= dt;

      //    // Between [0, 1]
      //    var fade = Math.abs(this.fading - this.fadeLength / 2) * 2 / this.fadeLength;

      //    this.setFade(fade);
      // }
      // else {
      //    this.setFade(1);
      // }
   };

   SpecialCube.prototype.fade = function() {
      // this.fading = this.fadeLength;
   };

   SpecialCube.Group = function() {
      Cube.Group.apply(this, arguments);

      this.cols = [];
      this.cubeList = [];
      this.CubeObj = SpecialCube;
   };

   SpecialCube.Group.prototype = Object.create(Cube.Group.prototype);

   SpecialCube.Group.prototype.addCube = function(x, y, z, color) {
      var cube = this.convertToCube(x, y, z, color);

      var pos_x = cube.position.x;

      if (!this.cols[pos_x]) {
         this.cols[pos_x] = new THREE.Group();
         this.cols[pos_x].position.x = pos_x;

         this.add(this.cols[pos_x]);
      }
      
      this.mapCube(cube);

      cube.position.x = 0;

      this.cubeList.push(cube);
      this.cols[pos_x].add(cube);
   };

   return SpecialCube;
})();