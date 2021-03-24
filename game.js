
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
    this.load.image('airflow', 'assets/airflow.png')
    this.load.image('base', 'assets/base.png')

    this.load.plugin('rexdragrotateplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js', true);

}

let ground
let jets = {
    totalPressure: 3,
    enabled: [true,true,true]
}

function create ()
{
    
    this.add.image(400,300,'background')
    ground = this.physics.add.staticGroup()
    ground.create(400,550,'ground')
    createJet(this, 130, 0)
    createJet(this, 400, 1)
    createJet(this, 670, 2)
}

function update()
{
}

function createJet(scene, xPos, jetPos){
    let air = scene.add.image(xPos, 500, 'airflow').setOrigin(.5,1)
    air.name = 'air' + jetPos
    air.scaleY = 2
    let jet = scene.add.image(xPos, 500, 'jet').setOrigin(.5,1)//.setInteractive()
    jet.name = 'jet' + jetPos
    scene.plugins.get('rexdragrotateplugin').add(scene, {x: xPos, y: 500, maxRadius: 120, minRadius: 0})
    .on('drag', function (dragRotate) {
        let newAngle = jet.rotation + dragRotate.deltaRotation;
        if(Math.abs(newAngle) < .7){
            jet.rotation = newAngle
            air.rotation = newAngle
        }
    })
    let base = scene.add.image(xPos, 500, 'base').setInteractive().on('pointerdown', () => {
        jets.enabled[jetPos] = !jets.enabled[jetPos]
        jetPressure(scene, 0)
        jetPressure(scene, 1)
        jetPressure(scene, 2)
    })
    return [jet, air, base];
}

function jetPressure(scene, jetPos){
    if(!jets.enabled[jetPos]){
        scene.children.getChildren().forEach((gameObj) =>{
            if(gameObj.name === 'air' + jetPos){
                gameObj.scaleY = 1
            }
        })
    }else{
        let enabledJets = 0;
        jets.enabled.forEach((enabledBool) => {
            if(enabledBool){
                enabledJets++
            }
        })
        scene.children.getChildren().forEach((gameObj) =>{
            if(gameObj.name === 'air' + jetPos){
                gameObj.scaleY = 1 + (jets.totalPressure / enabledJets)
            }
        })
    }
}
