var PieceFactory = (function() {
   var PieceFactory = function() {
      this.bucket = [];
   };

   PieceFactory.prototype.createRandom = function() {
      // Get another bag of pieces (according to "7 system")
      if (this.bucket.length < Tetrominos.names.length) {
         this.bucket.push.apply(this.bucket, Tetrominos.randomBag());
      }

      var cubeGroups = Array.prototype.slice.call(arguments);

      var model = this.bucket.shift();

      cubeGroups.forEach(function(cubeGroup) {
         cubeGroup.copy(model);

         cubeGroup.model = model;

         cubeGroup.clones.forEach(function(clone) {
            clone.model = model;
         })
      });

      return model;
   };

   PieceFactory.prototype.getNext = function(advance) {
      return this.bucket[advance];
   };

   return PieceFactory;
})();