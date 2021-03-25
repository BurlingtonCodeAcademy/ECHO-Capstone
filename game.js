// start button y<a href='https://pngtree.com/so/play'>play png from pngtree.com</a>

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("jet", "assets/jet.png");
  this.load.image("ball", "assets/orangeBall.png");
  this.load.image("airflow", "assets/airflow.png");
  this.load.image("base", "assets/base.png");
  this.load.image("button", "assets/button.png")
  
  this.load.image('hoop', 'assets/hoop.png')
  this.load.image('hoopFront', 'assets/hoopFront.png')

  this.load.plugin(
    "rexdragrotateplugin",
    "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js",
    true
  );
}

let startButton;
let button;
let ground;
let jets = {
  totalPressure: 3,
  enabled: [false, false, false],
};
let hoops = {
  passCount: 0,
  hoopState: ['empty', 'empty']
}
let gameState = {
  running: false,
  gameEnd: 0
}
let orangeBall;

function create() {
 
  this.add.image(400, 300, "background").setDepth(-5);
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);
  ground = this.matter.add
    .image(400, 550, "ground", null, { isStatic: true })
    .setDepth(1);
  createJet(this, 130, 0);
  createJet(this, 400, 1);
  createJet(this, 670, 2);
  createHoop(this, 265, 175, 0)
  createHoop(this, 535, 225, 1)

 
  orangeBall = this.matter.add.image(850, 200, "ball", null, {
    friction: 0.5,
    restitution: 0.5,
    shape: "circle",
  });
  orangeBall.setInteractive();
  this.input.setDraggable(orangeBall);
  this.input.on("drag", (pointer, gameObject, x, y) =>
    gameObject.setPosition(x, y)
  );
  this.input.on("dragstart", (pointer, gameObject) =>
    gameObject.setStatic(true)
  );
  this.input.on("dragend", (pointer, gameObject) =>
    gameObject.setStatic(false)
  );

  startButton = this.add.image(850, 30, "button").setInteractive().on('pointerdown', () => {
    if(!gameState.running){
      gameState.running = true
      jets.enabled[0] = true
      jets.enabled[1] = true
      jets.enabled[2] = true
      jetPressure(this, 0);
      jetPressure(this, 1);
      jetPressure(this, 2);
      hoops.passCount = 0
      gameState.gameEnd = Date.now() + 25000
    }
  })
  startButton.setScale(.09).setSize(200,200)

}

function update() {
  if(gameState.running && Date.now() > gameState.gameEnd){
    gameState.running = false
    jets.enabled[0] = false
    jets.enabled[1] = false
    jets.enabled[2] = false
    jetPressure(this, 0);
      jetPressure(this, 1);
      jetPressure(this, 2);
    console.log('Your score was ' + hoops.passCount)
  }
  this.children.getChildren().forEach((gameObj) => {
    if (
      gameObj.name.startsWith("air") &&
      this.matter.overlap(orangeBall, gameObj)
    ) {
      if (gameObj.getLocalPoint(orangeBall.x, orangeBall.y).y > 8) {
        this.matter.applyForceFromAngle(
          orangeBall,
          0.0025,
          gameObj.rotation - Math.PI / 2
        );
      }
      if (
        gameObj.getLocalPoint(orangeBall.x, orangeBall.y).x <
        gameObj.width / 2
      ) {
        this.matter.applyForceFromAngle(orangeBall, 0.001, gameObj.rotation);
      } else {
        this.matter.applyForceFromAngle(
          orangeBall,
          0.001,
          gameObj.rotation - Math.PI
        );
      }
    }else if(gameObj.name.startsWith('hoop')){
      let hoopPos = parseInt(gameObj.name[4])
      if(hoops.hoopState[hoopPos] !== 'empty' && !this.matter.overlap(orangeBall, gameObj)){
        if(hoops.hoopState[hoopPos] === 'enteredRight' && gameObj.getLocalPoint(orangeBall.x,orangeBall.y).x < gameObj.width / 2){
          hoops.passCount += 1
        }else if(hoops.hoopState[hoopPos] === 'enteredLeft' && gameObj.getLocalPoint(orangeBall.x,orangeBall.y).x > gameObj.width / 2){
          hoops.passCount += 1
        }
        console.log(hoops.passCount)
        hoops.hoopState[hoopPos] = 'empty'
      }else if(hoops.hoopState[hoopPos] === 'empty' && this.matter.overlap(orangeBall, gameObj)){
        if(orangeBall.isStatic()){
          hoops.hoopState[hoopPos] = 'drag'
        }else if(gameObj.getLocalPoint(orangeBall.x, orangeBall.y).x > gameObj.width / 2){
          hoops.hoopState[hoopPos] = 'enteredRight'
        }else{
          hoops.hoopState[hoopPos] = 'enteredLeft'
        }
      }else if(hoops.hoopState[hoopPos].startsWith('entered') && orangeBall.isStatic()){
        hoops.hoopState[hoopPos] = 'drag'
      }
    }
  });
}

function createJet(scene, xPos, jetPos) {
  let air = scene.matter.add
    .image(xPos, 500, "airflow", null, { isStatic: true })
    .setDepth(-1)
    .setCollisionCategory(null);
  air.name = "air" + jetPos;
  air.scaleY = 1;
  // air.setVisible(false)
  let jet = scene.matter.add
    .image(xPos, 500, "jet", null, { isStatic: true })
    .setScale(1.1);
  jet.name = "jet" + jetPos;
  scene.plugins
    .get("rexdragrotateplugin")
    .add(scene, { x: xPos, y: 500, maxRadius: 120, minRadius: 0 })
    .on("drag", function (dragRotate) {
      if (
        scene.matter.intersectPoint(
          dragRotate.pointer.worldX,
          dragRotate.pointer.worldY,
          [jet]
        ).length > 0
      ) {
        let newAngle = jet.rotation + dragRotate.deltaRotation;
        if (Math.abs(newAngle) < 0.7) {
          jet.rotation = newAngle;
          air.rotation = newAngle;
        }
      }
    });
  let base = scene.add
    .image(xPos, 500, "base")
    .setDepth(1)
    .setInteractive()
    .on("pointerdown", () => {
      if(gameState.running){
        jets.enabled[jetPos] = !jets.enabled[jetPos];
      jetPressure(scene, 0);
      jetPressure(scene, 1);
      jetPressure(scene, 2);
      }
    });
  return [jet, air, base,];
}

function jetPressure(scene, jetPos) {
  if (!jets.enabled[jetPos]) {
    scene.children.getChildren().forEach((gameObj) => {
      if (gameObj.name === "air" + jetPos) {
        let currRotate = gameObj.rotation;
        gameObj.rotation = 0;
        gameObj.scaleY = 1;
        gameObj.rotation = currRotate;
      }
    });
  } else {
    let enabledJets = 0;
    jets.enabled.forEach((enabledBool) => {
      if (enabledBool) {
        enabledJets++;
      }
    });
    scene.children.getChildren().forEach((gameObj) => {
      if (gameObj.name === "air" + jetPos) {
        let currRotate = gameObj.rotation;
        gameObj.rotation = 0;
        gameObj.scaleY = 1 + jets.totalPressure / enabledJets;
        gameObj.rotation = currRotate;
      }
    });
  }
}

function createHoop(scene, xPos, yPos, hoopPos){
  let hoop = scene.matter.add.image(xPos, yPos, 'hoop', null, {isStatic: true}).setCollisionCategory(null)
  hoop.name = 'hoop' + hoopPos
  let hoopFront = scene.add.image(xPos - 16, yPos, 'hoopFront').setDepth(5)
  let hoopTop = scene.matter.add.rectangle(xPos,yPos - 54, 12, 8, {isStatic:true})
  //hoopTop.setVisible(false)
  let hoopBottom = scene.matter.add.rectangle(xPos,yPos + 54, 12, 8, {isStatic:true})
  //hoopBottom.setVisible(false)
  return [hoop, hoopFront, hoopTop, hoopBottom]
}
