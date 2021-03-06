var start = function() {
   window.GAME_WIDTH = 694,
   window.GAME_HEIGHT = 694;

   // Initialize scene & camera
   var renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
   $('#game').append(renderer.domElement);

   Juicy.Game.init(renderer, GAME_WIDTH, GAME_HEIGHT, {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPACE: 32,
      ESC: 27,
      SHIFT: 16,
      ENTER: 13,

      I: 73,
      J: 74,
      K: 75,
      L: 76,

      W: 87,
      A: 65,
      S: 83,
      D: 68,
      Z: 90,
      X: 88
   });

   if (location.href.indexOf('localhost') >= 0) {
      var fpsOutput = document.createElement('div');
      fpsOutput.id = 'debug';

      Juicy.Game.setDebug(fpsOutput);
      document.body.appendChild(fpsOutput);
   }

   __em.init();

   // Load sounds
   Juicy.Sound.load('select', './audio/select2.mp3', false);
   Juicy.Sound.load('place_piece', './audio/place_piece.mp3', false, 4);
   Juicy.Sound.load('move', './audio/move_piece.mp3', false, 8);
   Juicy.Sound.load('rotate', './audio/rotate_piece.mp3', false, 8);
   Juicy.Sound.load('twister', './audio/Twister Tetris2.mp3', true, 1, 0.35);
   Juicy.Sound.load('combo_0', './audio/combo_0.mp3', false, 2);
   Juicy.Sound.load('combo_1', './audio/combo_1.mp3', false, 2);
   Juicy.Sound.load('combo_2', './audio/combo_2.mp3', false, 2);
   Juicy.Sound.load('combo_3', './audio/combo_3.mp3', false, 2);
   Juicy.Sound.load('combo_4', './audio/combo_4.mp3', false, 2);
   Juicy.Sound.load('levelup', './audio/Coin01.mp3', false);

   // Juicy.Game.setState(new EndGameScore(GAME_WIDTH, GAME_HEIGHT, 'classic2', 262, {}, {"seed": 0})).run();
   Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT, 'classic', 250, {}, {"seed": 0})).run();

   $('#report-bug').click(function() {
      Juicy.Game.setState(new ReportBug(GAME_WIDTH, GAME_HEIGHT, Juicy.Game.getState()));
   });

   return renderer.domElement;
};

$(document).ready(function() {
   var element = start();

   $('#fullscreen').click(function() {
      if(element.requestFullscreen) {
         element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
         element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
         element.webkitRequestFullscreen();
      } else if(element.msRequestFullscreen) {
         element.msRequestFullscreen();
      }
   });

   $('#play').click(function() {
      if (!element)
         element = start();

      $('#play').hide();
   });
});