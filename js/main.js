(function(document) {
   // Initialize scene & camers
   var renderer = new THREE.WebGLRenderer();
   renderer.setSize(window.innerWidth, window.innerHeight);
   document.body.appendChild(renderer.domElement);

   Input.init({
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPACE: 32,
      ESC: 27,

      W: 87,
      A: 65,
      S: 83,
      D: 68,
   })

   window.game = new Game(renderer);

   function update() {
      requestAnimationFrame(update);

      game.update(0.018);
      game.render(renderer);
   }

   update();
})(document);