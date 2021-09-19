var preloadSound = true;

var audioList = {
  "speedy_music": ["speedy_music.mp3"],
  "marker": ["marker.mp3"]
};

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    preloadSound = false;
}

var assetsObj = {
    "audio": preloadSound ? audioList : null
};
alert(123);
Crafty.scene('Loading', function() {
    Crafty.load(assetsObj,
        function() {
            //when loaded
            if (!preloadSound) {
                 Crafty.audio.add(audioList);
            }
            Crafty.scene('DemoGame');
        },

        function(e) {
            //progress
        },

        function(e) {
            //error
        }
    );
});

Crafty.scene('DemoGame', function() {
    Crafty.audio.play('marker',-1);
    Crafty.audio.play('speedy_music',-1);
}, function() {
});
alert(456);
