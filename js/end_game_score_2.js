/* 
 * Score screen
 */
EndGameScore = (function() {
   return Screen2D.extend({
      constructor: function(width, height, game_type, score, stats, replay) {
         Screen2D.apply(this, arguments);

         var self = this;
         window.scores = this;

         this.score = score;
         this.stats = stats;
         this.replay = replay;
         this.game_type = game_type;

         this.press_space = new ThreeImage('press_space_rendered.png');
         this.press_space.setScale(0.5);
         this.press_space.position.y = -285;

         this.loading = new ThreeImage('loading.png');
         // this.loading.setScale(0.5);
         this.loading.position.y = 0;
         this.scene.add(this.loading);

         // Create the objects
         this.title = new ThreeImage('score_rendered.png');
         this.scene.add(this.title);

         this.ready = false;

         HighScores.get(game_type).then(function(scores) {
            this.scene.remove(this.loading);
            this.ready = true;
            this.place = HighScores.getPlaceOnLeaderboard(score);

            var ypos = 20;
            if (this.place < 5) {
               this.gotHighScore = true;

               this.name = '';
            }
            else {
               ypos = -20;
               this.your_score = new ThreeImage('your_score_rendered.png');
               this.your_score.position.y = 40;
               this.your_score.position.z ++;
               this.scene.add(this.your_score);

               this.hudScore = SpecialCube.Group.FromString('' + score);
               this.hudScore.position.set(150, 35, 0);
               this.hudScore.scale.setScalar(3);
               this.scene.add(this.hudScore);
               this.scene.add(this.press_space);
            }

            this.scores = [];

            var numToShow = (this.gotHighScore ? 4 : 5);
            for (var i = 0; i < 5; i ++) {
               // Did you get the high score??
               if (i === this.place) {
                  this.scoreNameObject = new THREE.Object3D();
                  this.scoreNameObject.position.x = -260;
                  this.scoreNameObject.position.y = ypos - 15 - i * 50;
                  this.scoreNameObject.scale.setScalar(3.5);
                  this.scene.add(this.scoreNameObject);

                  this.placeholder = SpecialCube.Group.FromString('Your Name', { left: true });
                  this.placeholder.material.color.setRGB(0.4, 0.4, 0.4);
                  this.scoreNameObject.add(this.placeholder);

                  var string = this.score + '';
                      string = (new Array(24 - string.length)).join(' ') + string;
                  this.scoreObject = SpecialCube.Group.FromString(string);
                  this.scoreObject.material.color.setRGB(0, 1, 0);
                  this.scoreObject.scale.setScalar(3.5);
                  this.scoreObject.position.y = this.scoreNameObject.position.y;
                  this.scene.add(this.scoreObject);

                  ypos -= 75;
               }

               if (i >= numToShow || i >= scores.length) break;

               var scoreString = scores[i].score + '';
               var string = scores[i].name;
                   string += (new Array(24 - string.length - scoreString.length)).join(' ');
                   string += scoreString;

               var elem = SpecialCube.Group.FromString(string);
               elem.position.y = ypos - i * 50;
               elem.scale.setScalar(3);

               this.scene.add(elem);
            }
         }.bind(this));
      },

      keyPressed: function(keyCode) {
         if (!this.ready) return;

         if (!this.gotHighScore) {
            return;
         }

         if (keyCode === 8 && this.name.length > 0) {
            this.name = this.name.substr(0, this.name.length - 1);
            this.scoreNameObject.remove(this.scoreNameObject.children[this.scoreNameObject.children.length - 1]);
            return;
         }

         if (keyCode !== 8 && this.name.length > 10) return;
         if (keyCode !== 8 && keyCode !== 13 && (keyCode < 65 || keyCode > 90))
            return;

         this.scoreNameObject.remove(this.placeholder);
         var newLetter = String.fromCharCode(keyCode);
         if (keyCode >= 65 && keyCode <= 90) {
            newLetter = String.fromCharCode(keyCode + ('a'.charCodeAt(0) - 'A'.charCodeAt(0)));
         }

         if (newLetter) {
            var letter = SpecialCube.Group.FromString(newLetter);
                letter.material.color.setRGB(0, 1, 0);
                letter.position.x = this.name.length * 7;
            this.name += newLetter;
            this.scoreNameObject.add(letter);
         }
      },

      key_ENTER: function() {
         if (!this.ready) return;

         if (this.name.trim().length > 0) {
            this.gotHighScore = false;
            this.scene.add(this.press_space);
         }
      },

      key_SPACE: function() {
         if (!this.ready) return;
         if (this.gotHighScore) return;
         HighScores.submitScore(this.name, this.score, this.replay, this.game_type);

         Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT));
      },
   });
})();