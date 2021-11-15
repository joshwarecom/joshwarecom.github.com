var preloadSound = true;

var audioList = {
  "speedy_music": ["assets/mp3/speedy_music.mp3"],
  "marker": ["assets/mp3/marker.mp3"]
};

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    preloadSound = false;
}

var assetsObj = {
    "audio": preloadSound ? audioList : null
};

Crafty.scene('Loading', function() {
    Crafty.load(assetsObj,
        function() {
            if (!preloadSound) {
                 Crafty.audio.add(audioList);
            }
        },

        function(e) {
            //progress
        },

        function(e) {
            //error
        }
    );
});
