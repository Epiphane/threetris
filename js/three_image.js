var ThreeImage = (function() {
   var ThreeImage = function(url) {
      var image = new THREE.TextureLoader().load('textures/' + url);
          image.minFilter = THREE.NearestFilter;
          image.maxFilter = THREE.NearestFilter;
      var material = new THREE.SpriteMaterial({ map: image });

      THREE.Sprite.call(this, material);
   };

   ThreeImage.prototype = Object.create(THREE.Sprite.prototype);

   ThreeImage.prototype.setUVs = function(min_x, min_y, max_x, max_y) {
      this.material.map.offset.x = min_x;
      this.material.map.offset.y = min_y;
      this.material.map.repeat.x = max_x - min_x;
      this.material.map.repeat.y = max_y - min_y;
   };

   return ThreeImage;
})();