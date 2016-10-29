var autoRescale = true;

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    autoRescale = false;
}

Game = {
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init();
    //Crafty.background('rgb(0, 128, 0)');
    Crafty.scene('Loading');   
  }
}
