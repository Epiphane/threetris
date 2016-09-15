/* 
 * 2D screen
 */
var Screen2D = (function() {
   return Juicy.State.extend({
      constructor: function(width, height) {
         this.scene = new THREE.Scene();

         this.imageScale = 128;

         this.width = width;
         this.height = height;

         // Create random particle system first
         // this.particleSystem = new THREE.GPUParticleSystem({
         //    maxParticles: 250000
         // });
         // this.scene.add(this.particleSystem);
         this.tick = 0;

         // Lighting
         var ambientLight = new THREE.AmbientLight(0x606060);
         this.scene.add(ambientLight);

         var directionalLight = new THREE.DirectionalLight(0xffffff);
             directionalLight.position.set(1, 0.75, 0.5).normalize();
         this.scene.add(directionalLight);

         // Camera
         var orthoScale = 2;
         this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
         this.camera = new THREE.OrthographicCamera(-this.width / orthoScale, 
                                                     this.width / orthoScale, 
                                                     this.height / orthoScale, 
                                                    -this.height / orthoScale, -500, 1000);
         this.camera.position.y = 0;
         this.camera.position.z = 20;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));
         // this.camera.position.z = 250;
         // this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // this.backdrop = SpecialCube.Group.FromImage('./textures/backdrop.png');
         // this.scene.add(this.backdrop);
         this.backdrop = new ThreeImage('backdrop_rendered.png');
         this.backdrop.position.set(0, 0, -10);
         this.scene.add(this.backdrop);
      },

      update: function(dt, game) {
         this.tick += dt;
         if (this.tick < 0) this.tick = 0;

         // this.particleSystem.update(this.tick);

         // this.backdrop.update(dt);
      },

      render: function(renderer) {
         renderer.render(this.scene, this.camera);
      }
   });
})();