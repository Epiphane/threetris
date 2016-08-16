var HUDTetromino = (function() {
   var HUDTetromino = function(x, y, z) {
      THREE.Object3D.call(this);

      this.tetromino = new Cube.Group();

      this.position.set(x, y, z);

      this.add(this.tetromino);
   };

   HUDTetromino.prototype = Object.create(THREE.Object3D.prototype);

   HUDTetromino.prototype.setTetromino = function(tetromino) {
      this.tetromino.copy(tetromino);

      this.tetromino.position.copy(tetromino.position);
      this.tetromino.rotation.copy(tetromino.rotation);
      this.tetromino.scale.copy(tetromino.scale);
   };

   return HUDTetromino;
})();