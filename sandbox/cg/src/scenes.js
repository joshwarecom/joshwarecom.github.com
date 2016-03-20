var preloadSound = true;
var preloadGraphics = true;

var audioList = {
        "gasp": ["assets/gasp.aac", "assets/gasp.ogg", "assets/gasp.mp3"],
        "yummy": ["assets/yummy.aac", "assets/yummy.ogg", "assets/yummy.mp3"],
        "yuck": ["assets/yuck.aac", "assets/yuck.ogg", "assets/yuck.mp3"],
        "burp": ["assets/burp.aac", "assets/burp.ogg", "assets/burp.mp3"],
        "cough": ["assets/cough.aac", "assets/cough.ogg", "assets/cough.mp3"]
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
    Crafty.maxBananaCount = 10;
    Crafty.maxGreenBananaCount = 10;    
    Crafty.bananaCount = 0;
    Crafty.greenBananaCount = 0;
    
    this.banana1 = Crafty.e('Banana');
    this.enemyOwl = Crafty.e('EnemyOwl');
    this.pc = Crafty.e('PC');
    this.gamebordersouth = Crafty.e('GameborderSouth');

    this.mouseTrigger = Crafty.e('MouseTrigger');
    this.pc.mouseTrigger = this.mouseTrigger;
    this.pc.mouseTrigger.pc = this.pc;    

    this.banana1.freshPosition();
    this.banana1.originalBanana = true;
    Crafty.bananaCount++;
}, function() {
});