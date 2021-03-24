//Orange Ball attributes
// cartoon ball PNG Designed By 588ku from <a href="https://pngtree.com">Pngtree.com</a>

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background','assets/background.png')
    this.load.image('ground', 'assets/ground.png')
    this.load.image('jet', 'assets/jet.png')
    this.load.image("ball", "assets/orangeBall.png")

    this.load.plugin('rexdragrotateplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js', true);

}

let ground

function create ()
{
    this.physics.world.gravity.y = 60
    

    this.add.image(400,300,'background')
    ground = this.physics.add.staticGroup()
    ground.create(400,550,'ground')
    createJet(this, 130)
    createJet(this, 400)
    createJet(this, 670)
    // this.add.image(200, 200, "ball")
    var orangeBall = this.physics.add.sprite(850,200, "ball").setInteractive()
    orangeBall.setScale(.05).setSize(700,700)
    this.input.setDraggable(orangeBall)

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

    });
    
    this.physics.add.collider(orangeBall, ground)
    
}

function update()
{
}

function createJet(scene, xPos){
    let jet = scene.add.image(xPos, 500, 'jet').setOrigin(.5,1)
    scene.plugins.get('rexdragrotateplugin').add(scene, {x: xPos, y: 500, maxRadius: 120, minRadius: 0})
    .on('drag', function (dragRotate) {
        let newAngle = jet.rotation + dragRotate.deltaRotation;
        console.log(newAngle)
        if(Math.abs(newAngle) < .7){
            jet.rotation = newAngle
        }
    })
    return jet;
}