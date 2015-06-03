Crafty.c('MouseTrigger',  {
    init: function() {
    this.requires('2D, Mouse, Touch')
    .attr({
      w: 1024,
      h: 1024,
      x: 0,
      y: 0
    })
    .bind("MouseUp", function(e){
    Crafty.trigger('SingleClick', Crafty.mousePos);
    });
    },
});

Crafty.c('GameborderSouth',  {
    init: function() {
    this.requires('2D, Color, Canvas, HTML')
    .color('rgb(0, 0, 0)')
    .attr({
      w: 1024,
      h: 4096,
      x: 0,
      y: 425
    });
    },
});

Crafty.c('Banana',  {
    init: function() {
    this.requires('2D, Canvas, HTML, Collision, Gravity')
    //.color('rgb(255, 0, 0)')
    .attr({
      w: 50,
      h: 50,
      x: 0,
      y: 0
    })
    .append("<img src='assets/minibanana.gif' style='width: 50px; height: 50px; z-index: 11000;'>")
    .bind('Move', function(e) { 
        this.stopDropAtDestination();
    })        
    .consumable() 
    },
    freshPosition: function() {
        this.x = 100+(Math.random()*600);
        this.dest_y = 50+(Math.random()*300);                
        this.y = -75;       
        this.gravity();
    },
    stopDropAtDestination: function() {
        if (this.y >= this.dest_y) {
            this.antigravity();
            this.stopFalling();
        }
    },    
    consumable: function() {
        this.onHit('PC', function(e) {
            Crafty.audio.play('gasp');
            Crafty.audio.play('yummy');
            this.freshPosition();
            
            if (this.originalBanana) {
                newBanana = Crafty.e('Banana');
                newBanana.freshPosition();

                newGreenBanana = Crafty.e('GreenBanana');
                newGreenBanana.freshPosition();
            }
        })
    },
});

Crafty.c('GreenBanana',  {
    init: function() {
    this.requires('2D, Canvas, HTML, Collision, Gravity')
    //.color('rgb(255, 0, 0)')
    .attr({
      w: 50,
      h: 50,
      x: 0,
      y: 0
    })
    .append("<img src='assets/minibanana_green.gif' style='width: 50px; height: 50px; z-index: 11000;'>")
    .bind('Move', function(e) { 
        this.stopDropAtDestination();
    })        
    .consumable() 
    },
    freshPosition: function() {
        this.x = 100+(Math.random()*600);
        this.dest_y = 50+(Math.random()*300);                
        this.y = -75;       
        this.gravity();
    },
    stopDropAtDestination: function() {
        if (this.y >= this.dest_y) {
            this.antigravity();
            this.stopFalling();
        }
    },    
    consumable: function() {
        this.onHit('PC', function(e) {
            Crafty.audio.play('gasp');
            Crafty.audio.play('yuck');
            this.freshPosition();
        })
    },
});

Crafty.c('PC',  {
      orientMovement: function() {
                        xmove = false;
                        ymove = false;
                        if ((this.moveDestination.x+6) >= this.x) { 
                            this._movement.x = 3;
                            xmove = true;
                        }
                        if ((this.moveDestination.x-6) <= this.x) { 
                            this._movement.x = -3;
                            if (!xmove) {
                                xmove = true;
                            }
                            else { xmove = false;}
                        }
                        if ((this.moveDestination.y+6) >= this.y) { 
                            this._movement.y = 3;
                            ymove = true;
                        }
                        if ((this.moveDestination.y-6) <= this.y) { 
                            this._movement.y = -3;
                            if (!ymove) {
                                ymove = true;
                            }
                            else { ymove = false;}
                        }
                        if (!xmove) this._movement.x = 0;
                        if (!ymove) this._movement.y = 0;
                        if (xmove || ymove) {
                        }
                        else {
                            return this.mouseMovement = false;
                        }
                        return this.mouseMovement = true;
  },
    init: function() {
    this.requires('2D, Canvas, HTML, Fourway')
    .attr({
      w: 70,
      h: 70,
      x: 0,
      y: 0
    })
    //.color('rgb(0, 0, 255)')    
    .fourway(4)
    .bind('SingleClick', function(data) {
        if (!this.moveDestination) {
            this.oldMoveDestination = {x: -1, y: -1};
            this.moveDestination = {x: data.x, y: data.y};
        }
        else {
            this.oldMoveDestination = {x: this.moveDestination.x, y: this.moveDestination.y};
            this.moveDestination = {x: data.x, y: data.y};
        }
        if (this.oldMoveDestination.x != this.moveDestination.x || this.oldMoveDestination.y != this.moveDestination.y || this.moveDestination.x != this.x || this.moveDestination.y != this.y) {
            this._movement.x = 0;
            this._movement.y = 0; 
            this._speed = 0;
            this.mouseTrigger.unbind("EnterFrame");
            this.mouseTrigger.bind("EnterFrame", function(e) {
                if (!this.pc.orientMovement()) {
                    this.unbind("EnterFrame");
                }
            });            
        }
    })
    .append("<img src='assets/cbat.gif' style='margin-top: -55px; margin-left: -80px; z-index: 12000;'>");
    },
});
