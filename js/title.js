/* 
 * Title screen
 */
Title = (function() {
   var SpecialCube = function() {
      Cube.apply(this, arguments);
   };

   SpecialCube.prototype = Object.create(Cube.prototype);

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
         this.camera.position.z = 100;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // Create the objects
         var title = this.title = new Cube.Group();
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
            var dy = 10;
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
      },

      render: function(renderer) {
         renderer.render(this.scene, this.camera);
      }
   });
})();