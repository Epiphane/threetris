HighScores = (function() {
   var HighScores = {};
   var currentScores = [];

   $.get('http://thomassteinke.com/threetris/__em.php?scores=true').then(function(scores) {
      currentScores = scores;
   });

   HighScores.getPlaceOnLeaderboard = function(score) {
      for (var i = 0; i < currentScores.length; i ++) {
         if (score > currentScores[i].score) {
            return i;
         }
      }
      return currentScores.length;
   }

   HighScores.get = function(game_type) {
      return $.get('http://thomassteinke.com/threetris/__em.php?scores=' + game_type).then(function(scores) {
         currentScores = scores;

         return scores;
      });
   }  

   HighScores.submitScore = function(name, score, replay, game_type) {
      console.log({
         name: name,
         replay: JSON.stringify(replay),
         score: score,
         game_type: game_type
      });
      $.post('http://thomassteinke.com/threetris/__em.php', {
         name: name,
         replay: JSON.stringify(replay),
         score: score,
         game_type: game_type
      }).then(function(scores) {
         currentScores = scores;
      });
   }

   return HighScores;
})();