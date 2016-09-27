/* 
 * ReportBug screen
 */
ReportBug = (function() {
   return Screen2D.extend({
      constructor: function(width, height, prevState) {
         Screen2D.apply(this, arguments);

         var self = this;
         window.report = this

         this.prevState = prevState;

         // Create the objects
         this.title = new ThreeImage('bug_rendered.png');
         this.scene.add(this.title);

         this.apologyContainer = new THREE.Object3D();

         this.tagline = SpecialCube.Group.FromString('oh no!');
         this.tagline.position.set(0, 35, 0);
         this.tagline.scale.setScalar(3);
         this.apologyContainer.add(this.tagline);

         this.scene.add(this.apologyContainer);
         var apology = new ThreeImage('apology.png');
             apology.position.y = -140;
             apology.position.z ++;
         this.apologyContainer.add(apology);

         this.thanksContainer = new THREE.Object3D();
         [
            'Thank you! I will look into solutions',
            '',
            'You can go back to your game now, or',
            'restart if it broke.'
         ].forEach(function(str, index) {
            var thanks = SpecialCube.Group.FromString(str, { left: true });
            thanks.position.set(-300, -30 - index * 30, 0);
            thanks.scale.setScalar(2);
            self.thanksContainer.add(thanks);
         });

         this.what_happened = SpecialCube.Group.FromString('What happened?');
         this.what_happened.position.copy(this.tagline.position);
         this.what_happened.position.y -= 50;
         this.what_happened.scale.setScalar(3);
         this.submission = $('<textarea style="position: absolute"></textarea>');
         this.submission.width(400);
         this.submission.height(100);
         this.submission.css({
            top: '400px',
            left: '150px'
         });
         this.submitButton = $('<button>Submit</button>');
         this.submitButton.css({
            position: 'absolute',
            padding: '10px 40px',
            top: '550px',
            left: '430px'
         });
         this.cancelButton = $('<button>Cancel</button>');
         this.cancelButton.css({
            position: 'absolute',
            padding: '10px 40px',
            top: '550px',
            left: '150px'
         });
         this.resumeButton = $('<button>Resume Game</button>');
         this.resumeButton.css({
            position: 'absolute',
            padding: '10px 40px',
            top: '550px',
            left: '386px'
         });
         this.restartButton = $('<button>Restart</button>');
         this.restartButton.css({
            position: 'absolute',
            padding: '10px 40px',
            top: '550px',
            left: '150px'
         });

         this.submitButton.click(this.submit.bind(this));
         this.cancelButton.click(this.cancel.bind(this));
         this.resumeButton.click(this.cancel.bind(this));
         this.restartButton.click(this.restart.bind(this));

         $('#report-bug').hide();

         this.submitting = false;
      },

      submit: function() {
         this.submission.remove();
         this.submitButton.remove();
         this.cancelButton.remove();
         $('body').append(this.resumeButton);
         $('body').append(this.restartButton);

         $.post('http://thomassteinke.com/threetris/__em.php', {
            message: this.submission.val() + (this.prevState instanceof ActiveGame ? this.prevState.getSave() : '')
         });

         this.scene.remove(this.what_happened);
         this.scene.add(this.thanksContainer);
      },

      cancel: function() {
         Juicy.Game.setState(this.prevState);
         $('#report-bug').show();

         this.submission.remove();
         this.submitButton.remove();
         this.cancelButton.remove();
         this.resumeButton.remove();
         this.restartButton.remove();
      },

      restart: function() {
         Juicy.Game.setState(new Menu(GAME_WIDTH, GAME_HEIGHT)).run();
         $('#report-bug').show();

         this.submission.remove();
         this.submitButton.remove();
         this.cancelButton.remove();
         this.resumeButton.remove();
         this.restartButton.remove();
      },

      key_SPACE: function() {
         if (!this.submitting) {
            this.submitting = true;
            $('body').append(this.submission);
            $('body').append(this.submitButton);
            $('body').append(this.cancelButton);
            this.scene.add(this.what_happened);
            this.scene.remove(this.apologyContainer);
         }
      },
   });
})();