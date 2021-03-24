//Orange Ball attributes
// cartoon ball PNG Designed By 588ku from <a href="https://pngtree.com">Pngtree.com</a>

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    physics: {
        default: 'matter',
        matter: {
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
    this.load.image('airflow', 'assets/airflow.png')
    this.load.image('base', 'assets/base.png')

    this.load.plugin('rexdragrotateplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js', true);

}

let ground
let jets = {
    totalPressure: 3,
    enabled: [true,true,true]
}
let orangeBall

function create ()
{   

    this.add.image(400,300,'background').setDepth(-5)
    this.matter.world.setBounds(0, 0, game.config.width, game.config.height)
    ground = this.matter.add.image(400 , 550 , 'ground', null, { isStatic: true}).setDepth(1)
    createJet(this, 130, 0)
    createJet(this, 400, 1)
    createJet(this, 670, 2)

    orangeBall = this.matter.add.image(850, 200, 'ball', null, {friction: .5, restitution: .5, shape: 'circle'})
    orangeBall.setInteractive()
    this.input.setDraggable(orangeBall);
    this.input.on("drag", (pointer, gameObject, x, y) => gameObject.setPosition(x, y));
    this.input.on("dragstart", (pointer, gameObject) => gameObject.setStatic(true));
    this.input.on("dragend", (pointer, gameObject) => gameObject.setStatic(false));
}

function update()
{
    this.children.getChildren().forEach((gameObj) => {
        if(gameObj.name.startsWith('air') && this.matter.overlap(orangeBall, gameObj)){
            console.log(gameObj.getLocalPoint(orangeBall.x, orangeBall.y))
        }
    })
}

function createJet(scene, xPos, jetPos){
    let air = scene.matter.add.image(xPos, 500, 'airflow',null,{isStatic:true}).setDepth(-1).setCollisionCategory(null)
    air.name = 'air' + jetPos
    air.scaleY = 2
    let jet = scene.matter.add.image(xPos, 500, 'jet',null,{isStatic:true})//.setOrigin(.5,1)//.setInteractive()
    jet.name = 'jet' + jetPos
    scene.plugins.get('rexdragrotateplugin').add(scene, {x: xPos, y: 500, maxRadius: 120, minRadius: 0})
    .on('drag', function (dragRotate) {
        let newAngle = jet.rotation + dragRotate.deltaRotation;
        if(Math.abs(newAngle) < .7){
            jet.rotation = newAngle
            air.rotation = newAngle
        }
    })
    let base = scene.add.image(xPos, 500, 'base').setDepth(1).setInteractive().on('pointerdown', () => {
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
                let currRotate = gameObj.rotation
                gameObj.rotation = 0
                gameObj.scaleY = 1
                gameObj.rotation = currRotate
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
                let currRotate = gameObj.rotation
                gameObj.rotation = 0
                gameObj.scaleY = 1 + (jets.totalPressure / enabledJets)
                gameObj.rotation = currRotate
            }
        })
    }
}