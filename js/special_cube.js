var SpecialCube = (function() {
   var minCol = 0;
   var WHITE = new THREE.Color(minCol, minCol, minCol);

   noise.seed(0);

   var SpecialCube = function() {
      Cube.apply(this, arguments);

      this.fading = 0;
      this.fadeLength = 4;
      this.realColor = this.material.color;
      this.material.color = this.material.color.clone();

      var scale = 1 / 50;
      this.timer = Math.PI * (1 + noise.simplex2(this.position.x / 30, this.position.y / 50));
   };

   SpecialCube.prototype = Object.create(Cube.prototype);

   SpecialCube.prototype.setFade = function(fade) {
      fade = Math.min(fade * 0.4, 0.4);

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
   };

   SpecialCube.Group = function() {
      Cube.Group.apply(this, arguments);

      this.cubeList = [];
      this.CubeObj = SpecialCube;

      this.start = this.position.clone();
      this.dest = new THREE.Vector3();
      this.transition = { pos: 0, length: 0 };
      this.fadeDest = 1;
      this.fadeStart = this.opacity = 1;
      this.fading = { pos: 0, length: 0 };
      this.scaleStart = this.scale.clone();
      this.scaleDest = new THREE.Vector3();
      this.scaling = { pos: 0, length: 0 };
   };

   SpecialCube.Group.prototype = Object.create(Cube.Group.prototype);

   SpecialCube.Group.prototype.addCube = function(x, y, z, color) {
      var cube = this.convertToCube(x, y, z, color);

      var pos_x = cube.position.x;

      this.add(cube);
      
      this.mapCube(cube);

      this.cubeList.push(cube);
   };

   SpecialCube.Group.prototype.moveTo = function(dest, time, onComplete) {
      this.dest.copy(dest);
      this.start.copy(this.position);
      this.transition.pos = 0;
      this.transition.length = time || 1;

      this.onCompleteTransition = onComplete;
   };

   SpecialCube.Group.prototype.fadeTo = function(final, time, onComplete) {
      this.fadeDest = final;
      this.fadeStart = this.opacity;
      this.fading.pos = 0;
      this.fading.length = time || 1;

      this.onCompleteFade = onComplete;
   };

   SpecialCube.Group.prototype.scaleTo = function(final, time, onComplete) {
      this.scaleDest.copy(final);
      this.scaleStart.copy(this.scale);
      this.scaling.pos = 0;
      this.scaling.length = time || 1;

      this.onCompleteScale = onComplete;
   };

   SpecialCube.Group.prototype.isAnimating = function() {
      return (this.fading.pos < this.fading.length) || (this.transition.pos < this.transition.length);
   };

   SpecialCube.Group.prototype.update = function(dt) {
      var self = this;
      this.cubeList.forEach(function(block) {
         block.update(dt);

         block.material.opacity = self.opacity;
      });

      if (this.fading.pos < this.fading.length) {
         this.fading.pos = Math.min(this.fading.pos + dt, this.fading.length);
         var percentage = Math.pow(this.fading.pos / this.fading.length, 1);

         this.opacity = percentage * this.fadeDest + (1 - percentage) * this.fadeStart;

         if (this.onCompleteFade && percentage === 1) {
            this.onCompleteFade();
         }
      }

      if (this.transition.pos < this.transition.length) {
         this.transition.pos = Math.min(this.transition.pos + dt, this.transition.length);
         var percentage = Math.pow(this.transition.pos / this.transition.length, 0.7);

         this.position.x = percentage * this.dest.x + (1 - percentage) * this.start.x;
         this.position.y = percentage * this.dest.y + (1 - percentage) * this.start.y;
         this.position.z = percentage * this.dest.z + (1 - percentage) * this.start.z;

         if (this.onCompleteTransition && percentage === 1) {
            this.onCompleteTransition();
         }
      }

      if (this.scaling.pos < this.scaling.length) {
         this.scaling.pos = Math.min(this.scaling.pos + dt, this.scaling.length);
         var percentage = Math.pow(this.scaling.pos / this.scaling.length, 0.7);

         this.scale.x = percentage * this.scaleDest.x + (1 - percentage) * this.scaleStart.x;
         this.scale.y = percentage * this.scaleDest.y + (1 - percentage) * this.scaleStart.y;
         this.scale.z = percentage * this.scaleDest.z + (1 - percentage) * this.scaleStart.z;

         if (this.onCompleteScale && percentage === 1) {
            this.onCompleteScale();
         }
      }
   };

   var imageCache = {};

   SpecialCube.Group.FromImage = function(url, skipCache) {
      if (imageCache[url] && !skipCache) {
         return imageCache[url];
      }

      var group = imageCache[url] = new SpecialCube.Group();

      var image = new Image();
          image.src = url;

      image.onload = function() {
         var canvas = document.createElement('canvas');
         canvas.width = image.width;
         canvas.height = image.height;
         canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

         var pixelData = canvas.getContext('2d').getImageData(0, 0, image.width, image.height).data;

         var dx = - image.width / 2;
         var dy = image.height / 2;
         for (var y = 0; y < image.height; y ++) {
            for (var x = 0; x < image.width; x ++) {
               var ndx = (x + y * image.width) * 4;
               var color = 0;
                   color += pixelData[ndx] << 16;
                   color += pixelData[ndx + 1] << 8;
                   color += pixelData[ndx + 2];

               if (color) {
                  group.addCube(x + dx, dy - y, 0, color);
               }
            }
         }
      }

      return group;
   };

   var fontImage = new Image();
       fontImage.src = './textures/font.png';
       fontImage.ready = false;
       fontImage.onReady = [];
   var font = { width: 0, height: 0 };

   fontImage.onload = function() {  
      var canvas = document.createElement('canvas');
      canvas.width = fontImage.width;
      canvas.height = fontImage.height;
      canvas.getContext('2d').drawImage(fontImage, 0, 0, fontImage.width, fontImage.height);

      var pixelData = canvas.getContext('2d').getImageData(0, 0, fontImage.width, fontImage.height).data;
      var letter_height = font.height = fontImage.height;
      var letter_width  = font.width  = fontImage.width / 26;

      var A = 'A'.charCodeAt(0);
      for (var char = 0; char < 26; char ++) {
         var letter = String.fromCharCode(A + char);
         var letterData = [];

         for (var y = 0; y < letter_height; y ++) {
            for (var x = 0; x < letter_width; x ++) {
               var ndx = (x + char * letter_width + y * fontImage.width) * 4;
               var color = 0;
                   color += pixelData[ndx] << 16;
                   color += pixelData[ndx + 1] << 8;
                   color += pixelData[ndx + 2];

               if (color) {
                  letterData.push([x, font.height - y]);
               }
            }
         }

         font[letter] = letterData;
      }

      fontImage.ready = true;
      while (fontImage.onReady.length) {
         fontImage.onReady.shift()();
      }
   };

   function FormCubeGroupFromString(group, string, options) {
      options = options || {};
      options.left = options.left || false;
      options.color = options.color || group.material.color;

      string = string.toUpperCase();
      var dx = options.left ? 0 : -((font.width + 1) * string.length) / 2;
      var dy = -font.height / 2;

      for (var ndx = string.length - 1; ndx >= 0; ndx --) {
         var letterData = font[string[ndx]];

         if (string[ndx] === ' ')
            continue;

         letterData.forEach(function(coord) {
            var x = coord[0];
            var y = coord[1];

            group.addCube(x + dx + ndx * (font.width + 1), y + dy, 0, options.color);
         });
      }
   }

   SpecialCube.Group.FromString = function(string, options) {
      var group = new SpecialCube.Group(0xffffff);

      if (fontImage.ready) {
         FormCubeGroupFromString(group, string, options);
      }
      else {
         fontImage.onReady.push(function() {
            FormCubeGroupFromString(group, string, options);
         });
      }

      return group;
   };

   return SpecialCube;
})();