var preloadSound = true;
var preloadGraphics = true;

var audioList = {
        "laugh": ["hogLaugh.mp3"],
};

var graphicsList = ["assets/cbat.gif", "assets/minibanana.gif", "assets/minibanana_green.gif", "assets/owlLeft.gif", "assets/owlRight.gif"];

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    preloadSound = false;
}

var assetsObj = {
    "audio": preloadSound ? audioList : null,
    "images": preloadGraphics ? graphicsList : null
};

Crafty.scene('Loading', function() {
    Crafty.load(assetsObj,
        function() {
            //when loaded
            if (!preloadSound) {
                 Crafty.audio.add(audioList);
            }
            Crafty.scene('SimpleGame');
            Crafty.viewport.scale(Crafty.DOM.window.width/800);
        },

        function(e) {
            //progress
        },

        function(e) {
            //error
        }
    );
});

Crafty.scene('SimpleGame', function() {
    //Crafty.audio.play('laugh',-1);
}, function() {
});
