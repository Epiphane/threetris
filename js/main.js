(function(document) {
   window.GAME_WIDTH = 664,
   window.GAME_HEIGHT = 600;

   // Initialize scene & camera
   var renderer = new THREE.WebGLRenderer();
   renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
   document.body.appendChild(renderer.domElement);

   Juicy.Game.init(renderer, GAME_WIDTH, GAME_HEIGHT, {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPACE: 32,
      ESC: 27,
      SHIFT: 16,

      W: 87,
      A: 65,
      S: 83,
      D: 68,
   });

   Juicy.Game.setState(new Title(GAME_WIDTH, GAME_HEIGHT)).run();
})(document);