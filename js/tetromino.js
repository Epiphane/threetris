var Tetrominos = (function() {
   // Boring 2d piece configurations
   var L = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[1, 1, 0]];
   var J = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[-1, 1, 0]];
   var T = [[0, 0, 0],[-1, 0, 0],[1, 0, 0],[0, 1, 0]];
   var O = [[0, 0, 0],[1, 0, 0],[1, 1, 0],[0, 1, 0]];
   var I = [[0, 0, 0],[1, 0, 0],[-1, 0, 0],[2, 0, 0]];
   var Z = [[0, 0, 0],[1, 0, 0],[-1, 1, 0],[0, 1, 0]];
   var S = [[0, 0, 0],[-1, 0, 0],[0, 1, 0],[1, 1, 0]];

   // Experimental 3d pieces
   var pieces = [
      {
         name: 'L',
         size: 3,
         cubes: [[1, 1, 0],[0, 1, 0],[2, 1, 0],[2, 2, 0],
                 [2, 1,-1],[2, 1,-2]],
         color: new THREE.Color(1, 117/255, 0) // Orange
      },
      {
         name: 'J',
         size: 3,
         cubes: [[1, 1, 0],[0, 1, 0],[2, 1, 0],[0, 2, 0],
                 [0, 1,-1],[0, 1,-2]],
         color: new THREE.Color(73/255, 0, 1) // Blue
      },
      {
         name: 'T',
         size: 3,
         cubes: [[1, 1,-1],[0, 1,-1],[2, 1, 0],[1, 2,-1],
                 [1, 1, 0],[1, 1,-2]],
         color: new THREE.Color(1, 0, 219/255) // Purple
      },
      {
         name: 'O',
         size: 2,
         cubes: [[0, 0, 0],[1, 0, 0],[1, 1, 0],[0, 1, 0],
                 [0, 0,-1],[1, 0,-1],[1, 1,-1],[0, 1,-1]],
         color: new THREE.Color(1, 219/255, 0) // Yellow
      },
      {
         name: 'I',
         size: 4,
         cubes: [[0, 1, 0],[1, 1, 0],[2, 1, 0],[3, 1, 0]],
         color: new THREE.Color(0, 146/255, 1) // Cyan
      },
      {
         name: 'Z',
         size: 3,
         cubes: [[1, 1,-1],[2, 1,-1],[0, 2,-1],[1, 2,-1],
                 [1, 1, 0],[1, 2,-2]],
         color: new THREE.Color(1, 0, 0) // Red
      },
      {
         name: 'S',
         size: 3,
         cubes: [[1, 1,-1],[0, 1,-1],[1, 2,-1],[2, 2,-1],
                 [1, 2, 0],[1, 1,-2]],
         color: new THREE.Color(73/255, 1, 0) // Green
      },
   ];

   var Tetrominos = { names: [] };

   pieces.forEach(function(piece) {
      var group = Tetrominos[piece.name] = new Cube.Group();

      group.setColor(piece.color);

      for (var attrib in piece) {
         if (attrib !== 'cubes' && attrib !== 'color') {
            group[attrib] = piece[attrib];
         }
      }

      piece.cubes.forEach(function(cube) {
         group.addCube.apply(group, cube);
      });

      Tetrominos.names.push(piece.name);
   });

   var chance = new Chance(Math.floor(Math.random() * 1000));
   Tetrominos.seed = function(seed) {
      chance = new Chance(seed);
   };

   Tetrominos.getSeed = function() {
      return chance.seed;
   };

   // Return a new "bag" of 7 tetrominos, shuffled.
   Tetrominos.randomBag = function() {
      var bag = this.names.map(function(letter) { return Tetrominos[letter]; });

      // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
      // Not even embarassed
      var j, x, i;
      for (i = bag.length; i; i--) {
         j = chance.integer({ min: 0, max: i - 1 });
         x = bag[i - 1];
         bag[i - 1] = bag[j];
         bag[j] = x;
      }

      return bag;
   };

   // Now for previews. Since a tetromino does not copy rotation/scaling/position, we can
   // modify both of those for the "preview" tetromino, which is kept in a parent Object3D
   // for location on the HUD.
   Tetrominos.names.forEach(function(letter) {
      var tetromino = Tetrominos[letter];

      var scale = 0.7;

      // Set display scale
      tetromino.scale.set(scale, scale, scale);

      // Offset it to fit nicely
      tetromino.position.set(-scale / 2 - (tetromino.size - 2) * scale / 2, 0, 0);

      if (tetromino.size === 2) {
         tetromino.position.y += scale;
      }
   });

   return Tetrominos;
})();