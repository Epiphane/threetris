/* 
 * Game screen
 */
Game = (function() {
   var orthoScale = 2;
   var delayAddOnInput = 1;
   var tick = 0;
   var inputDelay = {};
   var TOP = 11;

   // options passed during each spawned
   options = {
      position: new THREE.Vector3(),
      positionRandomness: .2,
      velocity: new THREE.Vector3(0., .05, 0.),
      velocityRandomness: .2,
      color: 0xaa88ff,
      colorRandomness: .2,
      turbulence: 0,
      lifetime: 2,
      size: 8,
      sizeRandomness: 1
   };

   return Juicy.State.extend({
      constructor: function(width, height) {
         window.game = this;

         this.hudScene = new THREE.Scene();

         this.inputEnabled = true;

         this.width = width;
         this.height = height;

         this.hudScene.rotation.z = Math.PI / 18;

         this.scene = new THREE.Object3D();
         this.scene.scale.set(25, 25, 1);
         this.hudScene.add(this.scene);

         // Create random particle system first
         this.particleSystem = new THREE.GPUParticleSystem({
            maxParticles: 250000
         });
         this.scene.add(this.particleSystem);

         // Lighting
         var ambientLight = new THREE.AmbientLight(0x606060);
         this.hudScene.add(ambientLight);

         var directionalLight = new THREE.DirectionalLight(0xffffff);
             directionalLight.position.set(1, 0.75, 1).normalize();
         this.hudScene.add(directionalLight);

         // Create the objects
         this.container = new THREE.Object3D();
         this.container.position.y = -0.5;
         this.scene.add(this.container);

         this.core = new THREE.Object3D();
         this.container.add(this.core);

         this.coreRotation = 0;
         this.rotationSpeed = 10;

         this.fallTimer = 0;
         this.fallDelay = 70;

         this.combo = 0;
         this.t_spin = false;
         this.last_move = false;
         this.difficult = false;

         this.level = 1;
         this.goal = this.getGoalForLevel(1);
         this.score = 0;
         this.stats = {};
         this.linesRemoved = 0;

         // Don't let you hard drop within 0.5 seconds of new piece on accident
         this.dropBlock = 0;

         // Base for the game
         this.floor = new Cube.LayeredGroup();
         this.floor.position.x =  0;
         this.floor.position.y = -11;
         this.core.add(this.floor);

         this.floor_width = this.depth = 10;

         // Create The base
         for (var i = 0; i < this.floor_width; i ++) {
            for (var j = 0; j < this.depth; j ++) {
               this.floor.addCube(i - (this.floor_width - 1) / 2, 0, j - (this.depth - 1) / 2);
            }
         }
         
         this.grid_color = new THREE.Color(0x443333);
         this.grid_material = new THREE.LineDashedMaterial({
            color: this.grid_color,
            opacity: 0.3,
            dashSize: 1, gapSize: 0.5,
            linewidth: 2
         });

         this.newThing = new Cube.Group(0xff0000);
         this.previewThing = new Cube.Group(0xff0000);
         this.previewThing.material.transparent = true;
         this.previewThing.material.opacity = 0.25;

         this.container.add(this.newThing);
         this.container.add(this.previewThing);

         this.pieceFactory = new PieceFactory();

         // Camera
         this.camera = new THREE.OrthographicCamera(-width / orthoScale, 
                                                     width / orthoScale, 
                                                     height / orthoScale, 
                                                    -height / orthoScale, -500, 1000);
         this.camera.position.y = 0;
         this.camera.position.z = 100;
         this.camera.lookAt(new THREE.Vector3(0, 0, 0));

         // Backup (so you can press Shift and save a piece for later)
         this.backup = null;
         this.backupPreview = null;
         this.hasUsedBackup = false;

         // Set up the HUD
         this.hudImage = new ThreeImage('hud_tilt.png');
         this.hudImage.position.set(0, 0, 100);
         this.hudImage.setScale(1);
         this.hudScene.add(this.hudImage);

         // Set up the level
         this.hudLevel = new Number();
         this.hudLevel.position.set(-243, -59, 101);
         this.hudScene.add(this.hudLevel);
         this.hudLevel.set(this.level);

         // Set up the level
         this.hudGoal = new Number();
         this.hudGoal.position.set(-243, -187, 101);
         this.hudScene.add(this.hudGoal);
         this.hudGoal.set(this.goal);

         // Set up the level
         this.hudScore = new Number();
         this.hudScore.position.set(37, 311, 101);
         this.hudScene.add(this.hudScore);
         this.hudScore.set(this.score);

         // Setup HUD previews and "backup" piece
         this.hud_save = new HUDTetromino(-225, 90, 102);
         this.hudScene.add(this.hud_save);

         this.game_over = new ThreeImage('game_over.png');
         this.game_over.position.set(1, -14, 199);
         this.game_over.material.opacity = 0;
         this.hudScene.add(this.game_over);

         this.you_win = new ThreeImage('you_win.png');
         this.you_win.position.set(1, -14, 199);
         this.you_win.material.opacity = 0;
         this.hudScene.add(this.you_win);

         this.previews = [
            new HUDTetromino(228, 130, 102),
            new HUDTetromino(228, 40, 102),
            new HUDTetromino(228, -50, 102),
            new HUDTetromino(228, -140, 102),
            new HUDTetromino(228, -230, 102),
         ];

         var scene = this.hudScene;
         this.previews.forEach(function(preview) {
            scene.add(preview);
         });

         this.newPiece();

         this.playing = false;

         $.post('http://thomassteinke.com/__em.php', {
            play: true
         });
      },

      actions: {
         LEFT: 1,
         RIGHT: 2,
         DROP: 3,
         HARDDROP: 4,
         ROT_CCW: 5,
         ROT_CW: 6,
         BACKUP: 7,
      },

      nextLevel: function() {
         this.hudLevel.set(++this.level);

         this.setGoal(this.getGoalForLevel(this.level));
         this.reduceFallDelay();

         Juicy.Sound.play('levelup');
      },

      getGoalForLevel: function(level) {
         return 3;
      },

      setGoal: function(goal) {
         this.goal = goal;
         this.hudGoal.set(this.goal);

         return this.goal;
      },

      addScore: function(score) {
         this.score += score;

         this.hudScore.set(this.score);
      },

      resetPiece: function() {
         this.newThing.position.x = -0.5;
         this.newThing.position.y = TOP - this.newThing.max.y;
         this.newThing.position.z = 4.5;

         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;
         }

         // GG
         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.gameEnded = true;

            this.game_over.fadeTo(0.97);
         }

         this.predictFall();
      },

      newPiece: function() {
         this.previewThing.clear();

         this.pieceFactory.createRandom(this.newThing, this.previewThing);

         this.resetPiece();

         this.hasUsedBackup = false;
         this.dropBlock = 0.5;

         for (var i = 0; i < this.previews.length; i ++) {
            this.previews[i].setTetromino(this.pieceFactory.getNext(i));
         }
      },

      predictFall: function() {
         this.previewThing.position.copy(this.newThing.position);

         while (!this.previewThing.intersects(this.floor, this.coreRotation)) {
            this.previewThing.position.y --;

            if (this.previewThing.position.y < -40)     
               throw new Error('Detecting an infinite preview drop. aborting');
         }

         this.previewThing.position.y ++;
      },

      reduceFallDelay: function() {
         if (this.fallDelay > 6) {
            this.fallDelay = Math.floor(this.fallDelay * 6 / 7);
         }
      },

      onBlockPlaced: function() {},

      fall: function() {
         this.newThing.position.y --;
         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;

            var y_min = Math.max(this.floor.position.y + this.floor.min.y + 1, this.newThing.position.y + this.newThing.min.y);
            var y_max = this.newThing.position.y + this.newThing.max.y;
            this.floor.absorb(this.newThing, this.coreRotation);
            
            var linesRemoved = 0;

            // T-Spin?
            if (this.newThing.model.name === 'T' &&
               (this.last_move === this.actions.ROT_CW || this.last_move === this.actions.ROT_CCW)) {
               var corners = 0;
               if (this.floor.hasCubeAt(this.newThing.position.x, this.newThing.position.y, this.coreRotation))
                  corners ++;
               if (this.floor.hasCubeAt(this.newThing.position.x + 2, this.newThing.position.y, this.coreRotation))
                  corners ++;
               if (this.floor.hasCubeAt(this.newThing.position.x, this.newThing.position.y + 2, this.coreRotation))
                  corners ++;
               if (this.floor.hasCubeAt(this.newThing.position.x + 2, this.newThing.position.y + 2, this.coreRotation))
                  corners ++;

               if (corners >= 3) {
                  this.t_spin = true;
               }
            }
            else {
               this.t_spin = false;
            }

            // Check each level
            for (var y = y_min; y <= y_max; y ++) {
               var solid = true;

               for (var x = -4.5; x <= 4.5 && solid; x ++) {
                  solid = this.floor.hasCubeAt(x, y, this.coreRotation);
               }

               if (solid) {
                  linesRemoved ++;
                  this.removeRow(y--);

                  if (this.setGoal(this.goal - 1) <= 0) {
                     this.nextLevel();
                  }
               }
            }

            if (linesRemoved > 0) {
               var yay = linesRemoved - 1 + this.combo;
               if (yay > 4) yay = 4;
               Juicy.Sound.play('combo_' + yay);

               var points = 50 * this.level * this.combo++;
               var last_difficult = this.difficult;

               this.difficult = false;
               if (!this.t_spin) {
                  if (linesRemoved === 1)
                     points += 100 * this.level;
                  else if (linesRemoved === 2)
                     points += 300 * this.level;
                  else if (linesRemoved === 3)
                     points += 500 * this.level;
                  else if (linesRemoved === 4) {
                     points += 800 * this.level;
                     this.difficult = true;
                  }
               }
               else {
                  this.difficult = true;
                  if (linesRemoved === 1)
                     points += 800 * this.level;
                  else if (linesRemoved === 2)
                     points += 1200 * this.level;
                  else if (linesRemoved === 3)
                     points += 1600 * this.level;
               }

               if (last_difficult && this.difficult) {
                  points *= 3/2;
               }

               this.addScore(points);
            }
            else {
               if (this.t_spin)
                  points += 400 * this.level;

               this.combo = 0;
            }

            this.coreRotation += Math.PI / 2;

            Juicy.Sound.play('place_piece');
            this.newPiece();

            this.onBlockPlaced();

            return true;
         }

         this.last_move = this.actions.DROP;

         return false;
      },

      wouldCollide: function(piece) {
         piece.position.y --;

         var collide = piece.intersects(this.floor, this.coreRotation);

         piece.position.y ++;

         return collide;
      },

      move: function(dx) {
         var moved = true;
         this.newThing.position.x += dx;

         if (this.wouldCollide(this.newThing)) {
            this.fallTimer = this.fallDelay;
         }
         else {
            this.fallTimer += Math.min(this.fallDelay / 3, delayAddOnInput);
         }

         if (this.newThing.intersects(this.floor, this.coreRotation)) {
            moved = false;
            this.newThing.position.x -= dx;
         }

         if (this.newThing.position.x + this.newThing.min.x < -(this.floor_width - 1) / 2) {
            moved = false;
            this.newThing.position.x = -(this.floor_width - 1) / 2 - this.newThing.min.x; 
         }


         if (this.newThing.position.x + this.newThing.max.x > (this.floor_width - 1) / 2) {
            moved = false;
            this.newThing.position.x = (this.floor_width - 1) / 2 - this.newThing.max.x; 
         }

         if (moved) {
            Juicy.Sound.play('move');
         }

         this.predictFall();
      },

      moveLeft: function() {
         this.move(-1);
         this.last_move = this.actions.LEFT;

         this.fallTimer += Math.min(this.fallDelay / 3, delayAddOnInput);
      },

      moveRight: function() {
         this.move(1);
         this.last_move = this.actions.RIGHT;

         this.fallTimer += Math.min(this.fallDelay / 3, delayAddOnInput);
      },

      rotateLeft: function() {
         this.last_move = this.actions.ROT_CW;

         this.newThing.rotate(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
         this.previewThing.rotate(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
         
         this.fallTimer += Math.min(this.fallDelay / 3, delayAddOnInput);

         while (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;
         }

         this.move(0);

         Juicy.Sound.play('rotate');

         this.predictFall();
      },

      rotateRight: function() {
         this.last_move = this.actions.ROT_CCW;

         this.newThing.rotate(new THREE.Vector3(0, 0, 1), Math.PI / 2);
         this.previewThing.rotate(new THREE.Vector3(0, 0, 1), Math.PI / 2);
         
         this.fallTimer += Math.min(this.fallDelay / 3, delayAddOnInput);

         while (this.newThing.intersects(this.floor, this.coreRotation)) {
            this.newThing.position.y ++;
         }

         this.move(0);

         Juicy.Sound.play('rotate');

         this.predictFall();
      },

      testInput: function(game, key, ifPressed) {
         if (!inputDelay[key]) inputDelay[key] = 0;

         if (inputDelay[key]-- <= 0) {
            if (game.keyDown(key)) {
               ifPressed.call(this);
               inputDelay[key] = 8;
            }
         }
         if (!game.keyDown(key)) {
            inputDelay[key] = 0;
         }
      },

      removeRow: function(y) {
         // Remove the actual row
         this.floor.removeRow(y);

         options.position.y = y;
         var granularity = 0.01;

         options.position.z = Math.floor(this.depth / 2);
         options.velocity.x = 0;
         options.velocity.z = 5;
         for (var x = 0; x < this.floor_width; x += granularity) {
            options.position.x = x - Math.floor(this.floor_width / 2);
            this.particleSystem.spawnParticle(options);
         }

         options.position.z *= -1;
         options.velocity.z *= -1;
         for (var x = 0; x < this.floor_width; x += granularity) {
            options.position.x = x - Math.floor(this.floor_width / 2);
            this.particleSystem.spawnParticle(options);
         }

         // And the other side now
         options.position.x = Math.floor(this.floor_width / 2);
         options.velocity.x = -options.velocity.z;
         options.velocity.z = 0.;
         for (var z = 0; z < this.depth; z += granularity) {
            options.position.z = z - Math.floor(this.depth / 2);
            this.particleSystem.spawnParticle(options);
         }

         options.position.x *= -1;
         options.velocity.x *= -1;
         for (var z = 0; z < this.depth; z += granularity) {
            options.position.z = z - Math.floor(this.depth / 2);
            this.particleSystem.spawnParticle(options);
         }
      },

      key_ESC: function() {
         this.paused = !this.paused;

         if (this.paused) {
            Juicy.Sound.pause('twister');
         }
         else {
            Juicy.Sound.play('twister');
         }
      },

      hardDrop: function() {
         if (this.dropBlock <= 0) {
            var drops = 0;
            while (!this.fall()) {
               if (drops++ > 40)     
                  throw new Error('Detecthing an infinite drop. aborting');    
            }
            // Points fam
            this.addScore(drops * 2);
            this.hardDrop();
            this.dropBlock = 0;
         }
      },

      key_SPACE: function() {
         if (!this.gameEnded) {
            this.hardDrop();
         }
         else if (!this.game_over.isAnimating() && !this.you_win.isAnimating()) {
            Juicy.Sound.stop('twister');
            Juicy.Game.setState(new Score(GAME_WIDTH, GAME_HEIGHT, this.gameType, this.score, this.stats));
         }
      },

      key_SHIFT: function() {
         this.useBackup();
      },

      useBackup: function() {
         if (!this.hasUsedBackup) {
            var backup = this.backup;
            var backupPreview = this.backupPreview;
            this.backup = this.newThing;
            this.backupPreview = this.previewThing;

            this.hud_save.setTetromino(this.backup.model);

            if (backup) {
               this.newThing = backup;
               this.resetPiece();

               this.previewThing = backupPreview;
            }
            else {
               this.newThing = new Cube.Group(0xff0000);
               this.previewThing = new Cube.Group(0xff0000);
               this.previewThing.material.transparent = true;
               this.previewThing.material.opacity = 0.25;

               this.newPiece();
            }

            this.container.add(this.newThing);
            this.container.add(this.previewThing);
            this.container.remove(this.backup);
            this.container.remove(this.backupPreview);

            this.predictFall();

            this.hasUsedBackup = true;
         }
      },

      onFinishRotation: function() {},

      update: function(dt, game) {
         if (!this.playing) {
            this.playing = true;

            Juicy.Sound.play('twister');
         }

         tick += dt;
         if (tick < 0) tick = 0;

         if (this.dropBlock > 0)
            this.dropBlock -= dt;

         this.particleSystem.update(tick);

         this.floor.update(dt);
         this.game_over.update(dt);
         this.you_win.update(dt);

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

               this.onFinishRotation();
            }
         }

         if (this.paused || this.gameEnded) return;

         if (this.inputEnabled) {
            this.testInput(game, 'LEFT', this.moveLeft);
            this.testInput(game, 'RIGHT', this.moveRight);
            this.testInput(game, 'J', this.moveLeft);
            this.testInput(game, 'L', this.moveRight);
            this.testInput(game, 'I', this.rotateLeft);
            this.testInput(game, 'A', this.rotateRight);
            this.testInput(game, 'D', this.rotateLeft);
            this.testInput(game, 'UP', this.rotateLeft);

            if (game.keyDown('DOWN') || game.keyDown('K')) {
               this.fallTimer -= 5;
            }
         }

         if (this.fallTimer-- <= 0) {
            if (!this.wouldCollide(this.newThing) || this.fallTimer <= -30) {
               this.fallTimer = this.fallDelay;
               
               this.fall();
            }
         }
      },

      render: function(renderer) {
         renderer.render(this.hudScene, this.camera);
      }
   });
})();