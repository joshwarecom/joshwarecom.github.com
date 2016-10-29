var autoRescale = true;

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    autoRescale = false;
}

Game = {
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init();
    Crafty.background('rgb(0, 128, 0)');
    Crafty.scene('Loading');
    Crafty.bind('ViewportResize', function(e) {
        if (autoRescale) {
            Crafty.viewport.scale(Crafty.DOM.window.width/800);
        }
        /*
        if (Crafty.DOM.window.width/Crafty.DOM.window.height < 1.8) {
            ratio = Crafty.DOM.window.width/400;
            perfectheight = 200 * ratio;
            heightdifference = Crafty.DOM.window.height - perfectheight;
            if (heightdifference > 0) {
                heightdifference /= 2;
                //document.body.style.marginTop = ''+(heightdifference/ratio)+'px';
            }
        }
        else {
            document.body.style.marginTop = '0px';
        }
        */
    })   
  }
}
