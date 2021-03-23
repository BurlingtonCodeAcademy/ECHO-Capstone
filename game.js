
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
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

    this.load.plugin('rexdragrotateplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js', true);

}

let ground

function create ()
{
    this.add.image(400,300,'background')
    ground = this.physics.add.staticGroup()
    ground.create(400,550,'ground')
    createJet(this, 130)
    createJet(this, 400)
    createJet(this, 670)
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