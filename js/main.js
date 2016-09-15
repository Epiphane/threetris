(function(document) {
   window.GAME_WIDTH = 694,
   window.GAME_HEIGHT = 694;

   // Initialize scene & camera
   var renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
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

   if (location.href.indexOf('localhost') >= 0) {
      var fpsOutput = document.createElement('div');
      fpsOutput.id = 'debug';

      Juicy.Game.setDebug(fpsOutput);
      document.body.appendChild(fpsOutput);
   }

   // Load sounds
   Juicy.Sound.load('select', './audio/select2.mp3', false);
   Juicy.Sound.load('place_piece', './audio/place_piece.mp3', false, 4);
   Juicy.Sound.load('move', './audio/move_piece.mp3', false, 8);
   Juicy.Sound.load('rotate', './audio/rotate_piece.mp3', false, 8);

   Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT)).run();
})(document);