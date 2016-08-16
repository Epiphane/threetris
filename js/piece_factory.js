var PieceFactory = (function() {
   var PieceFactory = function() {};

   var L = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[1, 1, 0]];
   var J = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[-1, 1, 0]];
   var T = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[0, 1, 0]];
   var O = [[0, 0, 0],[1, 0, 0],[1, 1, 0],[0, 1, 0]];
   var I = [[0, 0, 0],[1, 0, 0],[-1, 0, 0],[2, 0, 0]];
   var Z = [[0, 0, 0],[1, 0, 0],[-1, 1, 0],[0, 1, 0]];
   var S = [[0, 0, 0],[-1, 0, 0],[0, 1, 0],[1, 1, 0]];

   // Experimental 3d pieces
   var L = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[1, 1, 0],
            [1, 0,-1],[ 1, 0,-2]];
   var J = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[-1, 1, 0],
            [-1,0,-1],[-1, 0,-2]];
   var T = [[0, 0,-1],[-1, 0,-1],[1, 0, 0],[0, 1,-1],
            [0, 0, 0],[ 0, 0,-2]];
   var O = [[0, 0, 0],[1, 0, 0],[1, 1, 0],[0, 1, 0],
            [0, 0,-1],[1, 0,-1],[1, 1,-1],[0, 1,-1]];
   var I = [[0, 0, 0],[1, 0, 0],[-1, 0, 0],[2, 0, 0]];
   var Z = [[0, 0,-1],[1, 0,-1],[-1, 1,-1],[0, 1,-1],
            [0, 0, 0],[0, 1,-2]];
   var S = [[0, 0,-1],[-1,0,-1],[0, 1,-1],[1, 1,-1],
            [0, 1, 0],[0, 0,-2]];

   var pieces = [L, J, T, O, I, Z, S];
   var colors = [
      new THREE.Color(1, 0, 0),
      new THREE.Color(73/255, 1, 0),
      new THREE.Color(1, 219/255, 0),
      new THREE.Color(73/255, 0, 1),
      new THREE.Color(0, 146/255, 1),
      new THREE.Color(1, 0, 219/255),
      new THREE.Color(0, 1, 146/255),
   ];

   PieceFactory.prototype.createRandom = function() {
      var cubeGroups = Array.prototype.slice.call(arguments);

      var index = Math.floor(Math.random() * pieces.length);
      var nextPiece = pieces[index];

      cubeGroups.forEach(function(cubeGroup) {
         cubeGroup.setColor(colors[index]);

         for (var i = 0; i < nextPiece.length; i ++) {
            cubeGroup.addCube.apply(cubeGroup, nextPiece[i]);
         }
      });
   };

   return PieceFactory;
})();