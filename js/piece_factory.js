var PieceFactory = (function() {
   var PieceFactory = function() {};

   var L = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[1, 1, 0]];
   var P = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[-1, 1, 0]];
   var T = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[0, 1, 0]];
   var O = [[0, 0, 0],[1, 0, 0],[1, 1, 0],[0, 1, 0]];
   var I = [[0, 0, 0],[1, 0, 0],[-1, 0, 0],[2, 0, 0]];
   var Z = [[0, 0, 0],[1, 0, 0],[-1, 1, 0],[0, 1, 0]];
   var N = [[0, 0, 0],[-1, 0, 0],[0, 1, 0],[1, 1, 0]];

   var pieces = [L, P, T, O, I, Z, N];

   PieceFactory.prototype.createRandom = function(cubeGroup) {
      var nextPiece = pieces[Math.floor(Math.random() * pieces.length)];

      for (var i = 0; i < nextPiece.length; i ++) {
         cubeGroup.addCube.apply(cubeGroup, nextPiece[i]);
      }
   };

   return PieceFactory;
})();