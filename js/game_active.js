/* 
 * Active Game screen
 * aka not spectating
 */
ActiveGame = (function() {
   function Link(data, next) {
      this.next = next;
      this.data = data;
   }

   // TODO this has to be divisible by 3 fam. Dont be that way bb
   var LOG_LEN = 297;
   var LOG_BYTES = LOG_LEN * 32;

   return Game.extend({
      constructor: function(width, height) {
         Game.apply(this, arguments);

         // 99 32-bit integers is enough for 1056 3-bit records
         this._log32 = new Link(new Uint32Array(LOG_LEN), null);
         this._log32Offset = 0;
         this._log = [];
         this._pieces = [];
      },

      log: function(log) {
         var relativeOffset = this._log32Offset % 32;
         var index = (this._log32Offset - relativeOffset) / 32;

         // Add part of the log to our int
         this._log32.data[index] += log << relativeOffset;

         // Did it overflow?
         if (relativeOffset > 29) {
            this._log32.data[++index] += log >> 32 - relativeOffset;
         }

         // If we just filled the last array, make a new one
         this._log32Offset += 3;
         if (this._log32Offset >= LOG_BYTES) {
            this._log32 = new Link(new Uint32Array(LOG_LEN), this._log32);
            this._log32Offset -= LOG_BYTES;
         }
      },

      getSave: function() {
         var strings = [];
         var it = this._log32;
         while (it) {
            strings.unshift(btoa(it.data.join(',')))
            it = it.next;
         }
         return JSON.stringify({
            seed: Tetrominos.getSeed(),
            actions: strings.join(',')
         });
      },

      fall: function() {
         this.log(this.actions.DROP);
         return Game.prototype.fall.apply(this, arguments);
      },

      moveLeft: function() {
         this.log(this.actions.LEFT);
         return Game.prototype.moveLeft.apply(this, arguments);
      },

      moveRight: function() {
         this.log(this.actions.RIGHT);
         return Game.prototype.moveRight.apply(this, arguments);
      },

      rotateLeft: function() {
         this.log(this.actions.ROT_CCW);
         return Game.prototype.rotateLeft.apply(this, arguments);
      },

      rotateRight: function() {
         this.log(this.actions.ROT_CW);
         return Game.prototype.rotateRight.apply(this, arguments);
      },

      key_SPACE: function() {
         if (!this.gameEnded) {
            this.log(this.actions.HARDDROP);
            return Game.prototype.hardDrop.apply(this, arguments);
         }
         else if (!this.game_over.isAnimating() && !this.you_win.isAnimating()) {
            Juicy.Sound.stop('twister');
            Juicy.Game.setState(new Score(GAME_WIDTH, GAME_HEIGHT, this.gameType, this.score, this.stats));
         }
      },

      key_SHIFT: function() {
         if (!this.hasUsedBackup) {
            this.log(this.actions.BACKUP);
         }
         return Game.prototype.useBackup.apply(this, arguments);
      },

      update: function(dt, game) {
         return Game.prototype.update.apply(this, arguments);
         tick += dt;
         if (tick < 0) tick = 0;

         this.particleSystem.update(tick);

         this.floor.update(dt);

         if (this.paused) return;

         if (this.core.rotation.y !== this.coreRotation) {
            // console.log(this.grid_material.color)
            var pi_4 = Math.PI / 4;
            var dist = Math.abs(this.core.rotation.y % (Math.PI / 2) - pi_4) / pi_4;
            var scale = Math.pow(dist, 10) * 0.8 + 0.2;
            this.grid_material.color = new THREE.Color(this.grid_color.r * scale, 
                                                       this.grid_color.g * scale, 
                                                       this.grid_color.b * scale);

            var dist = this.rotationSpeed * Math.min(this.coreRotation - this.core.rotation.y, 1);

            this.core.rotation.y += dist * dt;

            if (Math.abs(this.coreRotation - this.core.rotation.y) < 0.01) {
               this.core.rotation.y = this.coreRotation;
               this.grid_material.color = this.grid_color;
            }
         }

         this.testInput(game, 'LEFT', this.moveLeft);
         this.testInput(game, 'RIGHT', this.moveRight);
         this.testInput(game, 'UP', this.rotateLeft);

         if (game.keyDown('DOWN')) {
            this.fallTimer -= 5;
         }

         if (this.fallTimer-- <= 0) {
            if (!this.wouldCollide(this.newThing) || this.fallTimer <= -6) {
               this.fallTimer = this.fallDelay;
               
               this.fall();
            }
         }
      }
   });
})();