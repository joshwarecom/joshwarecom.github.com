// Matter.js - http://brm.io/matter-js/

// Matter aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events;

var engine = Engine.create(document.body, { 
    render: {
        options: {
            background: 'http://brm.io/matter-js-demo/img/background.png',
            wireframes: false
        }
    }
});

var mouse = MouseConstraint.create(engine, {
    constraint: { stiffness: 1 }
});

var ground = Bodies.rectangle(395, 600, 815, 50, { 
    isStatic: true, 
    render: { 
      visible: false 
    } 
});

var rockOptions = { 
      render: { 
        sprite: { 
          texture: 'http://brm.io/matter-js-demo/img/rock.png' 
        } 
      } 
    };

var rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
    anchor = { x: 170, y: 450 },
    elastic = Constraint.create({ 
        pointA: anchor, 
        bodyB: rock, 
        stiffness: 0.1, 
        render: { 
            lineWidth: 5, 
            strokeStyle: '#dfa417' 
        } 
    });

var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y, column, row) {
    var texture = column % 2 === 0 ? 'http://brm.io/matter-js-demo/img/block.png' : 'http://brm.io/matter-js-demo/img/block-2.png';
    return Bodies.rectangle(x, y, 25, 40, { render: { sprite: { texture: texture } } });
});

var ground2 = Bodies.rectangle(610, 250, 200, 20, { 
    isStatic: true, 
    render: { 
        fillStyle: '#edc51e', 
        strokeStyle: '#b5a91c' 
    } 
});

var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y, column, row) {
    var texture = column % 2 === 0 ? 'http://brm.io/matter-js-demo/img/block.png' : 'http://brm.io/matter-js-demo/img/block-2.png';
    return Bodies.rectangle(x, y, 25, 40, { 
      render: { 
        sprite: { 
          texture: texture 
        } 
      } 
    });
});

World.add(engine.world, [mouse, ground, pyramid, ground2, pyramid2, rock, elastic]);

Events.on(engine, 'tick', function(event) {
    if (engine.input.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
        rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
        World.add(engine.world, rock);
        elastic.bodyB = rock;
    }
});

Engine.run(engine);


// show user how to fire a rock!
Events.on(engine, 'tick', function(event) {
  
    // go for the bottom pyramid
    if (engine.timing.timestamp < 1500) {
        rock.positionPrev.x += 15;
        rock.positionPrev.y -= 1; 
    }
  
    // go for the top pyramid
    if (engine.timing.timestamp > 2500 && engine.timing.timestamp < 3500) {
        rock.positionPrev.x += 10;
        rock.positionPrev.y -= 10; 
    }
});
  
// footer stuff
var footer = document.createElement('div');
footer.className = 'footer-links';
footer.innerHTML = '<a href="http://brm.io" target="_blank">brm.io</a> &middot; <a href="http://twitter.com/liabru" target="_blank">@liabru</a>';
document.body.appendChild(footer);
