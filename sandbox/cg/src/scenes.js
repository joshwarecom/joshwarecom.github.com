var assetsObj = {
    "audio": {
        "gasp": ["assets/gasp.aac", "assets/gasp.ogg", "assets/gasp.mp3"],
        "yummy": ["assets/yummy.aac", "assets/yummy.ogg", "assets/yummy.mp3"],
        "yuck": ["assets/yuck.aac", "assets/yuck.ogg", "assets/yuck.mp3"]
    },
    "images": ["assets/cbat.gif", "assets/minibanana.gif", "assets/minibanana_green.gif"]
};

Crafty.scene('Loading', function() {
    Crafty.load(assetsObj,
        function() {
            //when loaded
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
    this.square = Crafty.e('Banana');
    this.pc = Crafty.e('PC');
    this.gamebordersouth = Crafty.e('GameborderSouth');

    this.mouseTrigger = Crafty.e('MouseTrigger');
    this.pc.mouseTrigger = this.mouseTrigger;
    this.pc.mouseTrigger.pc = this.pc;    

    this.square.freshPosition();
    this.square.originalBanana = true;
}, function() {
});