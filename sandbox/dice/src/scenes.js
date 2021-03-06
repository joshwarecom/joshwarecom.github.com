var preloadSound = true;
var preloadGraphics = true;

var audioList = {
        "laugh": ["https://joshware.com/sandbox/dice/assets/evilLaugh.aac", "https://joshware.com/sandbox/dice/assets/evilLaugh.ogg", "https://joshware.com/sandbox/dice/assets/evilLaugh.mp3"],
};

var graphicsList = ["https://joshware.com/sandbox/dice/assets/skull.gif"];

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/iOS/i))) {
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
        },

        function(e) {
            //progress
        },

        function(e) {
            //error
        }
    );
});
