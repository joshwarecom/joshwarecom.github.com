var preloadSound = true;
var preloadGraphics = true;

var audioList = {
        "laugh": ["hogLaugh.mp3"],
};

var graphicsList = ["assets/cbat.gif", "assets/minibanana.gif", "assets/minibanana_green.gif", "assets/owlLeft.gif", "assets/owlRight.gif"];

var assetsObj = {
    "audio": preloadSound ? audioList : null,
    "images": preloadGraphics ? graphicsList : null
};

Crafty.scene('Loading', function() {
	errors = 0;
	successes = 0;

	barWidth = getGameWidth()/2;
	barHeight = getGameWidth()/15;

    Crafty.e("2D, DOM, Text")
        .attr({ x: (getGameWidth()/2)-(barWidth/2), y : (gameHeight/2)-(barHeight/2), w: barWidth, h: barHeight, z: 101 })
        .textFont({ type: 'bold', family: 'Courier', size:(barHeight*.75)+'px' })
        .text("Loading...")
        .css({ "text-align": "center" });

    Crafty.e("2D, DOM, ProgressBar")
        .attr({ x: (getGameWidth()/2)-(barWidth/2), y : (gameHeight/2)-(barHeight/2), w: barWidth, h: barHeight, z: 100 })
        // progressBar(Number maxValue, Boolean flipDirection, String emptyColor, String filledColor)
        .progressBar(100, false, "blue", "green")
        .bind("LOADING_PROGRESS", function(percent) {
            // updateBarProgress(Number currentValue)
            this.updateBarProgress(percent);
        });

    Crafty.load(assetsObj,
        function() {
			//loading
			if (errors > 0) {
			}
			if (successes > 0) {
			}
			Crafty.trigger("LOADING_PROGRESS", 100);
			Crafty.scene('Begin');
        },

        function(e) {
            //progress
            //sleep(300);
            successes++;
            //alert(JSON.stringify(e));
            Crafty.trigger("LOADING_PROGRESS", e.percent);
        },

        function(e) {
			//error
            //sleep(300);
            errors++;
			Crafty.trigger("LOADING_PROGRESS", e.percent);
			//alert(JSON.stringify(e));
        }
    );
});

Crafty.scene('Begin', function() {

	alert(123);

    Crafty.e("2D, DOM, Text")
        .attr({ x: (getGameWidth()/2)-(barWidth/2), y : (gameHeight/2)-(barHeight/2), w: barWidth, h: barHeight, z: 101 })
        .textFont({ type: 'bold', family: 'Courier', size:(barHeight*.75)+'px' })
        .text("Started...")
        .css({ "text-align": "center" });

	// START BUTTON
	var startButton = Crafty.e('2D, DOM, Color, Button, Mouse')
	.attr({x: 0, y: 0, w: 100, h: 100})
	.color('#F00')
	.bind('Click', function(MouseEvent){alert('clicked', MouseEvent);})
	.bind('MouseOver', function(MouseEvent){alert('over', MouseEvent);});

	alert(456);

}, function() {
});