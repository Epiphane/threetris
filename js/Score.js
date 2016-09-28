/* 
 * Score screen
 */
Score = (function() {
   return Screen2D.extend({
      constructor: function(width, height, game_type) {
         Screen2D.apply(this, arguments);

         var self = this;
         window.scores = this;

         this.game_type = game_type;

         this.press_space = new ThreeImage('press_space_rendered.png');
         this.press_space.position.y = -150;

         this.loading = new ThreeImage('loading.png');
         // this.loading.setScale(0.5);
         this.loading.position.y = -100;

         // Create the objects
         this.title = new ThreeImage('score_rendered.png');
         this.title.position.y = 30;
         this.scene.add(this.title);

         this.main_container = new THREE.Object3D();
         this.scene.add(this.main_container);

         this.all_time = new ThreeImage('all_time.png');
         this.all_time.position.set(-120, 40, 1);
         this.main_container.add(this.all_time);

         this.daily = new ThreeImage('daily.png');
         this.daily.position.set(80, 40, 1);
         this.main_container.add(this.daily);

         this.back = new ThreeImage('back_3.png');
         this.back.position.set(230, 40, 1);
         this.main_container.add(this.back);

         this.selector = new Cube.Group();
         this.selector.addCube(0, 0, 0);
         this.selector.material.color = new THREE.Color(1, 0, 1);
         this.selector.scale.setScalar(25);
         this.selector.position.set(-240, 40, 20);
         this.main_container.add(this.selector);

         this.selector_cube = this.selector.children[0];
         this.selector_cube.rotation.y = Math.PI / 4;
         this.selector_cube.rotation.x = Math.PI / 8;
         this.selector_cube.float_time = 0;

         this.elems = [];

         this.scoreCache = {};

         this.updateSelection();
      },

      selection: 0,

      drawScores: function(scores) {
         this.main_container.remove(this.loading);
         this.ready = true;

         var ypos = -20;

         this.scores = [];
         this.scoreCache[this.type] = scores;

         for (var i = 0; i < 5; i ++) {
            if (i >= scores.length) break;

            var scoreString = scores[i].score + '';
            var string = scores[i].name;
                string += (new Array(24 - string.length - scoreString.length)).join(' ');
                string += scoreString;

            var elem = SpecialCube.Group.FromString(string);
            elem.position.y = ypos - i * 50;
            elem.scale.setScalar(3);

            this.elems.push(elem);
            this.main_container.add(elem);
         }
      },

      loadScores: function(game_type, type) {
         this.type = type;
         if (this.scoreCache[type]) {
            this.drawScores(this.scoreCache[type]);
         }
         else {
            this.ready = false;
            this.main_container.add(this.loading);
            HighScores.get(game_type, type).then(this.drawScores.bind(this));
         }
      },

      key_LEFT: function() {
         if (this.gotHighScore) return;

         this.selection --;

         if (this.selection < 0) this.selection += 3;

         this.updateSelection();
      },

      key_RIGHT: function() {
         if (this.gotHighScore) return;

         this.selection = (this.selection + 1) % 3;
         
         this.updateSelection();
      },

      updateSelection: function() {
         while (this.elems.length) {
            this.main_container.remove(this.elems.shift());
         }

         switch (this.selection) {
            case 0:
               this.selector.position.x = -240;
               this.all_time.material.color.setRGB(2, 2, 2);
               this.daily.material.color.setRGB(1, 1, 1);
               this.back.material.color.setRGB(1, 1, 1);
               this.loadScores(this.game_type, 'all_time');
               break;
            case 1:
               this.selector.position.x = -5;
               this.all_time.material.color.setRGB(1, 1, 1);
               this.daily.material.color.setRGB(2, 2, 2);
               this.back.material.color.setRGB(1, 1, 1);
               this.loadScores(this.game_type, 'daily');
               break;
            case 2:
               this.selector.position.x = 160;
               this.all_time.material.color.setRGB(1, 1, 1);
               this.daily.material.color.setRGB(1, 1, 1);
               this.back.material.color.setRGB(2, 2, 2);
               this.elems.push(this.press_space);
               this.main_container.add(this.press_space);
               break;
         }
      },

      key_SPACE: function() {
         if (!this.ready) return;
         
         while (this.elems.length) {
            this.main_container.remove(this.elems.shift());
         }

         switch (this.selection) {
            case 0:
               this.scoreCache['all_time'] = false;
               this.loadScores(this.game_type, 'all_time');
               break;
            case 1:
               this.scoreCache['daily'] = false;
               this.loadScores(this.game_type, 'daily');
               break;
            case 2:
               Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT));
               break;
         }
      },

      update: function(dt) {
         this.selector_cube.float_time += 2 * dt;
         this.selector_cube.position.y = Math.cos(this.selector_cube.float_time) / 6;
         this.selector_cube.rotation.y += 0.5 * dt;
      }
   });
})();