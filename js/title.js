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
         // this.camera = new THREE.OrthographicCamera(-width / orthoScale, 
         //                                             width / orthoScale, 
         //                                             height / orthoScale, 
         //                                            -height / orthoScale, -500, 1000);

         this.camera.position.y = 0;
         this.camera.position.z = 300;
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
         
            self.waveLength = titleImg.width;
         }

         this.timer = 0;

         this.waveDelay = 1;
         this.waveMoveSpeed = 0.01;
         this.waveLength = 0;

         this.timePerPulse = 0.1;
      },

      key_SPACE: function() {
         Juicy.Game.setState(new Game(GAME_WIDTH, GAME_HEIGHT));
      },

      update: function(dt, game) {
         this.timer += dt;

         this.title.cubeList.forEach(function(block) {
            block.update(dt);
         });

         if (this.waveLength) {
            var waveTime = this.timer % (this.waveLength * this.waveMoveSpeed + this.waveDelay);
            var wavePos = waveTime / this.waveMoveSpeed + this.title.min.x;

            // this.title.cols.forEach(function(col) {
            //    if (Math.abs(col.position.x - wavePos) < 1)
            //       col.position.y = 1;

            //    else
            //       col.position.y = 0;
            // })

            // for (var dPos = Math.floor(wavePos - 5); dPos <= Math.floor(wavePos + 5); dPos ++) {
            //    pos_z = 5;//Math.max(0, 7 - Math.abs(dPos - wavePos));

            //    if (this.title.cols[dPos]) {
            //       this.title.cols[dPos].position.z = pos_z;
            //    }
            // }
         }
      },

      render: function(renderer) {
         renderer.render(this.scene, this.camera);
      }
   });
})();