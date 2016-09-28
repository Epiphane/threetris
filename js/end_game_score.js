/* 
 * End Game Score screen
 */
EndGameScore = (function() {
   return Score.extend({
      constructor: function(width, height, game_type, score, stats, replay) {
         this.selection = -1; // Don't draw anything yet
         Score.apply(this, arguments);

         this.main_container.position.y -= 45;

         this.score = score;
         this.stats = stats;
         this.replay = replay;

         this.your_score = new ThreeImage('your_score_rendered.png');
         this.your_score.position.y = 60;
         this.your_score.position.z ++;
         this.scene.add(this.your_score);

         this.hudScore = SpecialCube.Group.FromString('' + score);
         this.hudScore.position.set(150, 55, 0);
         this.hudScore.scale.setScalar(3);
         this.scene.add(this.hudScore);

         this.place = 6;
         this.gotHighScore = false;
         this.submitted = false;

         this.press_enter = new ThreeImage('press_enter_to_save.png');
         this.press_enter.position.set(0, -300, 1);
         this.press_enter.material.color.setRGB(2, 2, 2);

         HighScores.get(game_type, 'all_time').then(function(scores) {
            this.place = HighScores.getPlaceOnLeaderboard(score);
            if (this.place < 5) {
               this.selection = 0;
               this.gotHighScore = true;

               this.name = '';
               this.type = 'all_time';
               this.drawScores(scores);
               this.all_time.material.color.setRGB(0, 2, 0);
               this.scene.add(this.press_enter);
               this.main_container.remove(this.selector);
            }
            else {
               HighScores.get(game_type, 'daily').then(function(daily) {
                  this.place = HighScores.getPlaceOnLeaderboard(score);

                  if (this.place < 5) {
                     this.selection = 1;
                     this.gotHighScore = true;

                     this.name = '';
                     this.type = 'daily';
                     this.drawScores(daily);
                     this.selector.position.x = -5;
                     this.daily.material.color.setRGB(0, 2, 0);
                     this.scene.add(this.press_enter);
                     this.main_container.remove(this.selector);
                  }
                  else {
                     this.selection = 1;
                     this.updateSelection();
                  }
               }.bind(this));
            }
         }.bind(this));
      },

      selection: 1,

      // keyPressed: function(keyCode) {
      //    if (!this.ready) return;

      //    if (!this.gotHighScore) {
      //       return;
      //    }

      //    if (keyCode === 8 && this.name.length > 0) {
      //       this.name = this.name.substr(0, this.name.length - 1);
      //       this.scoreNameObject.remove(this.scoreNameObject.children[this.scoreNameObject.children.length - 1]);
      //       return;
      //    }

      //    if (keyCode !== 8 && this.name.length > 10) return;
      //    if (keyCode !== 8 && keyCode !== 13 && (keyCode < 65 || keyCode > 90))
      //       return;

      //    this.scoreNameObject.remove(this.placeholder);
      //    var newLetter = String.fromCharCode(keyCode);
      //    if (keyCode >= 65 && keyCode <= 90) {
      //       newLetter = String.fromCharCode(keyCode + ('a'.charCodeAt(0) - 'A'.charCodeAt(0)));
      //    }

      //    if (newLetter) {
      //       var letter = SpecialCube.Group.FromString(newLetter);
      //           letter.material.color.setRGB(0, 1, 0);
      //           letter.position.x = this.name.length * 7;
      //       this.name += newLetter;
      //       this.scoreNameObject.add(letter);
      //    }
      // },

      // key_ENTER: function() {
      //    if (!this.ready) return;

      //    if (this.name.trim().length > 0) {
      //       this.gotHighScore = false;
      //       this.scene.add(this.press_space);
      //    }
      // },

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
            this.scene.remove(this.press_enter);
            this.main_container.add(this.selector);
            HighScores.submitScore(this.name, this.score, this.replay, this.game_type);
         
            this.scene.remove(this.scoreNameObject);
            this.scene.remove(this.scoreObject);
            this.place = 10;

            this.scoreCache[this.type] = false;
            this.updateSelection();
         }
      },

      drawScores: function(scores) {
         this.main_container.remove(this.loading);
         this.ready = true;

         var ypos = -20;

         this.scores = [];
         this.scoreCache[this.type] = scores;

         var numToShow = (this.gotHighScore ? 4 : 5);
         for (var i = 0; i < 5; i ++) {
            // Did you get the high score??
            console.log(this.place);
            if (i === this.place) {
               this.scoreNameObject = new THREE.Object3D();
               this.scoreNameObject.position.x = -260;
               this.scoreNameObject.position.y = ypos - 45 - i * 50;
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

               ypos -= 50;
            }

            if (i >= numToShow || i >= scores.length) break;

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
   });
})();