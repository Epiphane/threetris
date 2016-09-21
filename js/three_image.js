var ThreeImage = (function() {
   var ThreeImage = function(url) {
      var self = this;

      var image = new THREE.TextureLoader().load('textures/' + url);
          image.minFilter = THREE.NearestFilter;
          image.maxFilter = THREE.NearestFilter;
      var material = new THREE.SpriteMaterial({ map: image, transparent: true });

      THREE.Sprite.call(this, material);

      this.lerp = { pos: 0, length: 0 };
      this.onLerpComplete = null;
      this.lerpStart  = {
         pos: new THREE.Vector3(),
         opacity: 1,
         scale: new THREE.Vector3(),
      };
      this.lerpDest  = {
         pos: new THREE.Vector3(),
         opacity: 1,
         scale: new THREE.Vector3(),
      };

      this.imageScale = 1;
      image.onUpdate = function() {
         self.setScale(self.imageScale);
      };
   };

   ThreeImage.prototype = Object.create(THREE.Sprite.prototype);

   ThreeImage.prototype.setScale = function(scale) {
      this.imageScale = scale;

      if (this.material.map.image) {
         var w = this.material.map.image.width;
         var h = this.material.map.image.height;
         var ratio = h / w;
         if (this.material.map.repeat.x !== 1 || 
            this.material.map.repeat.y !== 1) {
            ratio = 1;
         }
         this.scale.set(this.imageScale * this.material.map.image.width * this.material.map.repeat.x, 
                        this.imageScale * this.material.map.image.height * this.material.map.repeat.y, 
                        1);
      }
   };

   ThreeImage.prototype.setUVs = function(min_x, min_y, max_x, max_y) {
      this.material.map.offset.x = min_x;
      this.material.map.offset.y = min_y;
      this.material.map.repeat.x = max_x - min_x;
      this.material.map.repeat.y = max_y - min_y;

      this.setScale(this.imageScale);
   };

   ThreeImage.prototype.isAnimating = function(dt) {
      return (this.lerp.pos < this.lerp.length);
   }

   ThreeImage.prototype.update = function(dt) {
      if (this.lerp.pos < this.lerp.length) {
         this.lerp.pos = Math.min(this.lerp.pos + dt, this.lerp.length);
         var percentage = this.lerp.pos / this.lerp.length;

         if (this.lerpStart.opacity !== this.lerpDest.opacity) {
            this.material.opacity = percentage * this.lerpDest.opacity + 
               (1 - percentage) * this.lerpStart.opacity;
         }

         if (!this.lerpStart.pos.equals(this.lerpDest.pos)) {
            this.position.set(
               percentage * this.lerpDest.pos.x + (1 - percentage) * this.lerpStart.pos.x,
               percentage * this.lerpDest.pos.y + (1 - percentage) * this.lerpStart.pos.y,
               percentage * this.lerpDest.pos.z + (1 - percentage) * this.lerpStart.pos.z
            );
         }

         if (!this.lerpStart.scale.equals(this.lerpDest.scale)) {
            this.scale.set(
               percentage * this.lerpDest.pos.x + (1 - percentage) * this.lerpStart.pos.x,
               percentage * this.lerpDest.pos.y + (1 - percentage) * this.lerpStart.pos.y,
               percentage * this.lerpDest.pos.z + (1 - percentage) * this.lerpStart.pos.z
            );
         }

         if (percentage === 1) {
            this.lerpStart.pos.copy(this.lerpDest.pos);
            this.lerpStart.scale.copy(this.lerpDest.scale);
            this.lerpStart.opacity = this.lerpDest.opacity;

            if (this.onLerpComplete) {
               this.onLerpComplete();
            }
         }
      }
   };

   ThreeImage.prototype.initLerp = function(time, onComplete) {
      this.lerp.pos = 0;
      this.lerp.length = time || 1;
      this.onLerpComplete = onComplete;
   };

   ThreeImage.prototype.moveTo = function(position, time, onComplete) {
      this.initLerp(time, onComplete);

      this.lerpStart.pos.copy(this.position);
      this.lerpDest.pos.copy(position);
   };

   ThreeImage.prototype.scaleTo = function(scale, time, onComplete) {
      this.initLerp(time, onComplete);

      this.lerpStart.scale.copy(this.scale);
      this.lerpDest.scale.copy(scale);
   };

   ThreeImage.prototype.fadeTo = function(opacity, time, onComplete) {
      this.initLerp(time, onComplete);

      this.lerpStart.opacity = this.material.opacity;
      this.lerpDest.opacity = opacity;
   };

   return ThreeImage;
})();