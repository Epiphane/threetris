/* 
 * Title screen
 */
Title = (function() {
   return Juicy.State.extend({
      constructor: function(width, height) {
         var self = this;

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

         // Camera
         this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
         this.camera.position.z = 250;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // Create the objects
         var title = this.title = new SpecialCube.Group();
         this.scene.add(this.title);

         // Create the title
         var titleImg = new Image();
             titleImg.src = './textures/title.png';

         titleImg.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = titleImg.width;
            canvas.height = titleImg.height;
            canvas.getContext('2d').drawImage(titleImg, 0, 0, titleImg.width, titleImg.height);

            var pixelData = canvas.getContext('2d').getImageData(0, 0, titleImg.width, titleImg.height).data;

            var dx = - titleImg.width / 2;
            var dy = titleImg.height / 2;
            for (var y = 0; y < titleImg.height; y ++) {
               for (var x = 0; x < titleImg.width; x ++) {
                  var ndx = (x + y * titleImg.width) * 4;
                  var color = 0;
                      color += pixelData[ndx] << 16;
                      color += pixelData[ndx + 1] << 8;
                      color += pixelData[ndx + 2];

                  if (color) {
                     title.addCube(x + dx, dy - y, 0, color);
                  }
               }
            }
         }
      },

      key_SPACE: function() {
         Juicy.Game.setState(new Game(GAME_WIDTH, GAME_HEIGHT));
      },

      update: function(dt, game) {
         this.title.cubeList.forEach(function(block) {
            block.update(dt);
         });
      },

      render: function(renderer) {
         renderer.render(this.scene, this.camera);
      }
   });
})();