//setup phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: "#003555",
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

const widthScale = 800 / config.width;
const heightScale = 600 / (config.height - 100);

//load assets and plugins
function preload() {
  //-----------------------------------image pre loading-------------------------------//
  this.load.image("background", "assets/images/newbackground.png");
  this.load.image("jet", "assets/images/tube.png");
  this.load.image("ball", "assets/images/newball.png");
  this.load.image("airflow", "assets/images/air.png");
  this.load.image("baseOn", "assets/images/OnButtonBase.png"); 
  this.load.image("baseOff", "assets/images/OffButtonBase.png"); 
  this.load.image("button", "assets/images/blowerbutton-start.png");
  this.load.image("buttonDisabled", "assets/images/blowerbutton-pressed.png");
  this.load.image("leaf", "assets/images/leaf.png");
  this.load.image("hoop0", "assets/images/tall-hoop.png");
  this.load.image("hoop1", "assets/images/short-hoop.png");
  this.load.image("hoopFront", "assets/images/hoop-half.png");
  this.load.image("hoopOld", "assets/images/hoop.png");
  this.load.image("speakerIcon", "assets/images/speaker.png");
  this.load.image("mutedIcon", "assets/images/mute.png");
  this.load.image("bubble", "assets/images/bubble.png");
  this.load.image("anvil", "assets/images/anvil.png");
  this.load.image("balloon", "assets/images/Balloon.png");
  this.load.image("airplane", "assets/images/airplane.png");
  this.load.image("fabric", "assets/images/fabric.png");
  this.load.image("parachute", "assets/images/parachute.png");
  this.load.spritesheet("drop", "assets/images/waterAnimation.png", {
    frameWidth: 170,
    frameHeight: 75,
  });
  this.load.json("leafShape", "json/leaf.json");
  this.load.json("anvilShape", "json/anvil.json");
  this.load.json("balloonShape", "json/balloon.json");
  this.load.json("airplaneShape", "json/airplane.json");
  this.load.json("fabricShape", "json/fabric.json");
  this.load.json("parachuteShape", "json/parachute.json");
  //------------------------------------------Audio Preloading-----------------------------//
  // this.load.audio("ballBounce", ["assets/sfx/ballBounce.ogg"]);
  this.load.audio("StrongAir", ["assets/sfx/StrongAir.mp3"]); //loads in sound asset
  this.load.audio("BubblePop", ["assets/sfx/BubblePop.mp3"]);
  this.load.audio("ballBounce", ["assets/sfx/ballBounce.ogg"]);
  this.load.audio("waterDrop", ["assets/sfx/waterDrop.mp3"])
  //----------------------------------------Extensions and plugins preload--------------------//
  this.load.plugin(
    "rexdragrotateplugin",
    "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js",
    true
  );
}
//global variables
//game objects
let startButton;
let fabric;
let parachute;
let airplane;
let anvil;
let balloon;
let button;
let ground;
let orangeBall;
let ball2;
let leaf;
let bubbleL;
let bubbleM;
let bubbleS;
let drop;
let scoreDisplay;
let highDisplay;
let timeDisplay;
let speakerIcon;
let mutedIcon;
let baseOn = [];
let baseOff = [];

//state trackers
let jets = {
  totalPressure: 3,
  enabled: [false, false, false],
};
let hoops = {
  passCount: 0,
  hoopState: {},
};
let gameState = {
  running: false,
  gameEnd: 0,
  highScore: 0,
  objectsArr: [],
  objData: {},
};

//create function, phaser calls it once when setting up
function create() {
  //create background, ground, set world bounds, and display score and high score
  let background = this.add.image(400, 300, "background").setDepth(-5);
  background.scaleY = ((config.height - 100) * heightScale) / background.height;
  background.scaleX = (config.width * widthScale) / background.width;
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);
  ground = this.matter.add.rectangle(400, 505, 800, 3, { isStatic: true });
  scoreDisplay = this.add
    .text(40, 530, "Score: " + hoops.passCount)
    .setDepth(2);
  highDisplay = this.add
    .text(30, 550, "High Score: " + gameState.highScore)
    .setDepth(2);
  timeDisplay = this.add.line();
  timeDisplay.setDepth(5);
  timeDisplay.setStrokeStyle(10, 0xa8ff8b, 1);
  timeDisplay.setTo(0, 520, 64, 520);

  //create jets and hoops
  createJet(this, 130, 0);
  createJet(this, 400, 1);
  createJet(this, 670, 2);
  createHoop(this, 265, 328, 0); //175
  createHoop(this, 535, 355, 1); //225

  //create floatable objects
  orangeBall = this.matter.add.image(40, 600, "ball", null, {
    friction: 0.5,
    restitution: 0.5,
    shape: "circle",
  });

  orangeBall
    .setInteractive()
    .setScale((30 * widthScale) / orangeBall.width)
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        ballFX.play();
      }
    });
  orangeBall.name = "ballA";
  this.input.setDraggable(orangeBall);

  ball2 = this.matter.add.image(100, 650, "ball", null, {
    friction: 0.5,
    restitution: 0.5,
    shape: "circle",
  });
  ball2
    .setInteractive()
    .setScale(((30 * widthScale) / orangeBall.width) * 2)
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        ballFX.play();
      }
    });
  ball2.name = "ballB";
  ball2.tint = 0x808080;
  this.input.setDraggable(ball2);

  leaf = this.matter.add.image(170, 600, "leaf", null, {
    shape: this.cache.json.get("leafShape").leaf,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0.08,
    gravityScale: { x: 0.2 },
  });
  leaf.setInteractive().setScale((45 * widthScale) / leaf.width);
  leaf.name = "leaf";
  leaf.tint = 0x808080;
  this.input.setDraggable(leaf);

  anvil = this.matter.add.image(200, 600, "anvil", null, {
    shape: this.cache.json.get("anvilShape").anvil,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0,
    gravityScale: { x: 0 },
  });
  anvil.setInteractive().setScale((45 * widthScale) / anvil.width);
  anvil.name = "anvil";
  anvil.tint = 0x808080;
  this.input.setDraggable(anvil);

  balloon = this.matter.add.image(200, 600, "balloon", null, {
    shape: this.cache.json.get("balloonShape").balloon,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0.08,
    gravityScale: { x: 0.2 },
  });
  balloon.setInteractive().setScale((45 * widthScale) / balloon.width);
  balloon.name = "balloon";
  balloon.tint = 0x808080;
  this.input.setDraggable(balloon);

  fabric = this.matter.add.image(200, 600, "fabric", null, {
    shape: this.cache.json.get("fabricShape").fabric,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0.08,
    gravityScale: { x: 0.2 },
  });
  fabric.setInteractive().setScale((45 * widthScale) / fabric.width);
  fabric.name = "fabric";
  fabric.tint = 0x808080;
  this.input.setDraggable(fabric);

  parachute = this.matter.add.image(200, 600, "parachute", null, {
    shape: this.cache.json.get("parachuteShape").parachute,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0.08,
    gravityScale: { x: 0.2 },
  });
  parachute.setInteractive().setScale((45 * widthScale) / parachute.width);
  parachute.name = "parachute";
  parachute.tint = 0x808080;
  this.input.setDraggable(parachute);

  airplane = this.matter.add.image(200, 600, "airplane", null, {
    shape: this.cache.json.get("airplaneShape").airplane,
    friction: 0.7,
    restitution: 0,
    frictionAir: 0.08,
    gravityScale: { x: 0.2 },
  });
  airplane.setInteractive().setScale((45 * widthScale) / airplane.width);
  airplane.name = "airplane";
  airplane.tint = 0x808080;
  this.input.setDraggable(airplane);


  //sound fx for bubble pop
  let bubbleFX = this.sound.add("BubblePop", { volume: 0.55 });
  bubbleFX.setMute(true);

  bubbleL = this.matter.add.image(215, 650, "bubble", null, {
    shape: "circle",
    frictionAir: 0.12,
    density: 0.0007,
  });
  bubbleL
    .setInteractive()
    .setScale((40 * widthScale) / bubbleL.width)
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        bubbleFX.play();
        bubbleL.setStatic(true);
        bubbleL.x = gameState.objData[bubbleL.name].homeX;
        bubbleL.y = gameState.objData[bubbleL.name].homeY;
        hoops.hoopState[bubbleL.name][0] = "empty";
        hoops.hoopState[bubbleL.name][1] = "empty";
      }
    });
  bubbleL.name = "bubbleLarge";
  bubbleL.tint = 0x808080;
  this.input.setDraggable(bubbleL);

  bubbleM = this.matter.add.image(245, 635, "bubble", null, {
    shape: "circle",
    frictionAir: 0.12,
    density: 0.0007,
  });
  bubbleM
    .setInteractive()
    .setScale((25 * widthScale) / bubbleM.width)
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        bubbleFX.play();
        bubbleM.setStatic(true);
        bubbleM.x = gameState.objData[bubbleM.name].homeX;
        bubbleM.y = gameState.objData[bubbleM.name].homeY;
        hoops.hoopState[bubbleM.name][0] = "empty";
        hoops.hoopState[bubbleM.name][1] = "empty";
      }
    });
  bubbleM.name = "bubbleMedium";
  bubbleM.tint = 0x808080;
  this.input.setDraggable(bubbleM);

  bubbleS = this.matter.add.image(227, 620, "bubble", null, {
    shape: "circle",
    frictionAir: 0.12,
    density: 0.0007,
  });
  bubbleS
    .setInteractive()
    .setScale((17 * widthScale) / bubbleS.width)
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        bubbleFX.play();
        bubbleS.setStatic(true);
        bubbleS.x = gameState.objData[bubbleS.name].homeX;
        bubbleS.y = gameState.objData[bubbleS.name].homeY;
        hoops.hoopState[bubbleS.name][0] = "empty";
        hoops.hoopState[bubbleS.name][1] = "empty";
      }
    });
  bubbleS.name = "bubbleSmall";
  bubbleS.tint = 0x808080;
  this.input.setDraggable(bubbleS);

  drop = this.matter.add.sprite(270, 600, "drop", 0, { shape: "circle" });
  this.anims.create({
    key: "splash",
    frames: this.anims.generateFrameNumbers("drop", { start: 0, end: 5 }),
    frameRate: 20,
    repeat: 0,
  });
  this.anims.create({
    key: "normalDrop",
    frames: [{ key: "drop", frame: 0 }],
    frameRate: 20,
    repeat: -1,
  });
  drop
    .setInteractive()
    .setScale((30 * heightScale) / drop.height)
    .setBody({
      width: 32 * heightScale,
      height: 32 * heightScale,
      type: "circle",
    })
    .setOnCollide((pair) => {
      if (
        (!pair.bodyA.name || !pair.bodyA.name.startsWith("hoop")) &&
        (!pair.bodyB.name || !pair.bodyB.name.startsWith("hoop"))
      ) {
        waterFX.play();
        if(!drop.isStatic()){
          drop.setStatic(true);
        }
        drop.setCollisionCategory(null)
        hoops.hoopState[drop.name][0] = "empty";
        hoops.hoopState[drop.name][1] = "empty";
        drop.anims.play("splash");
      }
    })
    .on("animationcomplete", () => {
      drop.x = gameState.objData[drop.name].homeX;
      drop.y = gameState.objData[drop.name].homeY;
      drop.rotation = 0;
      drop.setCollisionCategory(1)
      drop.anims.play("normalDrop");
    });
  drop.name = "waterDrop";
  drop.tint = 0x808080;
  this.input.setDraggable(drop);

  //drag events
  this.input.on("drag", (pointer, gameObject, x, y) => {
    if (gameState.objData[gameObject.name].unlockAt <= gameState.highScore) {
      gameObject.setPosition(x, y);
    }
  });
  this.input.on("dragstart", (pointer, gameObject) => {
    // gameState.objectsArr.forEach(resetObj => {
    //   if(gameObject.name !== resetObj.name){
    //     if(!resetObj.isStatic()){
    //       resetObj.setStatic(true)
    //     }
    //     resetObj.x = gameState.objData[resetObj.name].homeX
    //     resetObj.y = gameState.objData[resetObj.name].homeY
    //   }
    // })
    gameObject.setCollisionCategory(null);
    if (!gameObject.isStatic()) {
      gameObject.setStatic(true);
    }
    //while the game is running, apply a score penalty for dragging objects
    if (gameState.running) {
      hoops.passCount -= Math.floor(
        gameState.objData[gameObject.name].scoreVal * 0.4
      );
      scoreDisplay.text = "Score: " + hoops.passCount;
    }
  });
  this.input.on("dragend", (pointer, gameObject) => {
    gameObject.setCollisionCategory(1);
    gameObject.setStatic(false);
  });

  //add floatable objects to gameState's array and fill out objData
  gameState.objectsArr.push(orangeBall);
  gameState.objData[orangeBall.name] = {
    scoreVal: 50,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 40,
    homeY: 600,
  };
  gameState.objectsArr.push(ball2);
  gameState.objData[ball2.name] = {
    scoreVal: 100,
    airEff: 2,
    flowPenalty: 4,
    unlockAt: 0,
    homeX: 100,
    homeY: 650,
  };
  gameState.objectsArr.push(leaf);
  gameState.objData[leaf.name] = {
    scoreVal: 150,
    airEff: 2.5,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 170,
    homeY: 600,
    floatRight: true
  };
  gameState.objectsArr.push(bubbleL);
  gameState.objData[bubbleL.name] = {
    scoreVal: 250,
    airEff: 5,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 215,
    homeY: 650,
  };
  gameState.objectsArr.push(bubbleM);
  gameState.objData[bubbleM.name] = {
    scoreVal: 250,
    airEff: 3,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 245,
    homeY: 635,
  };
  gameState.objectsArr.push(bubbleS);
  gameState.objData[bubbleS.name] = {
    scoreVal: 250,
    airEff: 1.5,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 227,
    homeY: 620,
  };
  gameState.objectsArr.push(drop);
  gameState.objData[drop.name] = {
    scoreVal: 300,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 270,
    homeY: 600,
  };
  gameState.objectsArr.push(anvil);
  gameState.objData[anvil.name] = {
    scoreVal: 300,
    airEff: 0,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 280,
    homeY: 645,
  };
  gameState.objectsArr.push(balloon);
  gameState.objData[balloon.name] = {
    scoreVal: 300,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 295,
    homeY: 660,
  };
  gameState.objectsArr.push(airplane);
  gameState.objData[airplane.name] = {
    scoreVal: 300,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 305,
    homeY: 675,
  };
  gameState.objectsArr.push(fabric);
  gameState.objData[fabric.name] = {
    scoreVal: 300,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 315,
    homeY: 685,
  };
  gameState.objectsArr.push(parachute);
  gameState.objData[parachute.name] = {
    scoreVal: 300,
    airEff: 1,
    flowPenalty: 0,
    unlockAt: 0,
    homeX: 325,
    homeY: 695,
  };

  

  //use gameState's array to populate hoopState
  gameState.objectsArr.forEach((gameObj) => {
    hoops.hoopState[gameObj.name] = ["empty", "empty"];
  });

  //-------------------------------------------------------------Sound FX------------------------------------------------------------------------//
  //sound FX for air
  let jetFX = this.sound.add("StrongAir", { volume: 0.35 });
  jetFX.setMute(true);

  //sound fx for ball bounce
  let ballFX = this.sound.add("ballBounce", { volume: 0.55 });
  ballFX.setMute(true);

  //sound fx for bubble pop
  let bubbleFX = this.sound.add("BubblePop", { volume: 0.55 });
  bubbleFX.setMute(true);

   //sound fx for water drop
   let waterFX = this.sound.add("waterDrop", { volume: 0.55 });
   waterFX.setMute(true);

  //--------------------------------------------buttons------------------------------------------//
  //setup start button
  startButton = this.add
    .image(750, 650, "button")
    .setInteractive()
    .on("pointerdown", () => {
      //when clicking the start button,
      //if the game is running do nothing,
      //otherwise start the game, turn on the jets, reset the score and set the time when the game will end
      if (!gameState.running) {
        gameState.running = true;
        startButton.setDepth(-1);
        jetFX.play();
        jets.enabled[0] = true;
        jets.enabled[1] = true;
        jets.enabled[2] = true;
        jetPressure(this, 0);
        jetPressure(this, 1);
        jetPressure(this, 2);
        hoops.passCount = 0;
        scoreDisplay.text = "Score: " + hoops.passCount;
        gameState.gameEnd = Date.now() + 25000;
        timeDisplay.setTo(0, 520, 864, 520);
        baseOff[0].setDepth(-1);
        baseOn[0].setDepth(1);
        baseOff[1].setDepth(-1);
        baseOn[1].setDepth(1);
        baseOff[2].setDepth(-1);
        baseOn[2].setDepth(1);
        //gameState.objectsArr.forEach(printObj => {console.log(printObj.name + '- X: ' + printObj.x + ', Y: ' + printObj.y)})
      }
    });

  startButton.setScale((80 * heightScale) / startButton.height).setDepth(1);
  this.add
    .image(750, 650, "buttonDisabled")
    .setScale((80 * heightScale) / startButton.height);
  //button to toggle muting, starts muted then toggles sound on. Might pull out and make own function
  speakerIcon = this.add
    .image(50, 40, "speakerIcon")
    .setInteractive()
    .on("pointerdown", () => {
      if (
        jetFX.setMute(false) &&
        bubbleFX.setMute(false) &&
        ballFX.setMute(false) &&
        waterFX.setMute(false)
      ) {
        jetFX.setMute(true)
        bubbleFX.setMute(true)
        ballFX.setMute(true);
        speakerIcon.setDepth(-6);
        mutedIcon.setDepth(1);
      }
    });
  speakerIcon.setScale(0.06).setDepth(-6);
  mutedIcon = this.add
    .image(50, 40, "mutedIcon")
    .setInteractive()
    .on("pointerdown", () => {
      if (
        jetFX.setMute(true) &&
        bubbleFX.setMute(true) &&
        ballFX.setMute(true) &&
        waterFX.setMute(true)
      ) {
        jetFX.setMute(false);
        bubbleFX.setMute(false);
        ballFX.setMute(false);
        waterFX.setMute(false)
        mutedIcon.setDepth(-6);
        speakerIcon.setDepth(1);
      }
    });
  mutedIcon.setScale(0.05).setDepth(1);
}
//--------------------------------------------------------------update-------------------------------------------//
//update function, runs repeatedly while phaser is loaded
function update() {
  //if an object is outside the play area put it at its home location
  gameState.objectsArr.forEach((gameObj) => {
    if (gameObj.y > 500 && !gameObj.isStatic()) {
      gameObj.setStatic(true);
      gameObj.x = gameState.objData[gameObj.name].homeX;
      gameObj.y = gameState.objData[gameObj.name].homeY;
      gameObj.rotation = 0;
    }
    // if(isNaN(gameObj.x) || isNaN(gameObj.y)){
    //   console.log('NaN detected')
    //   gameObj.x = gameState.objData[gameObj.name].homeX;
    //   gameObj.y = gameState.objData[gameObj.name].homeY;
      
    // }
  });
  //if the game is running, adjust the length of the time display
  if (gameState.running) {
    timeDisplay.setTo(
      0,
      520,
      64 + ((gameState.gameEnd - Date.now()) / 25000) * 800,
      520
    );
  }
  //if the water drop is not static, adjust its rotation based on its velocity
  if (
    !drop.isStatic() &&
    Math.abs(drop.body.velocity.x) + Math.abs(drop.body.velocity.y) !== 0
  ) {
    drop.rotation =
      Math.atan2(drop.body.velocity.y, drop.body.velocity.x) - Math.PI / 2;
  }
  //leaf falling behavior
  if (!leaf.isStatic() && leaf.body.velocity.y > 0.1 /*&& Date.now() % 140 < 3*/) {
    // let force = (Math.random() - 0.5) * 0.5;
    // leaf.setAngularVelocity(force);
    // this.matter.applyForceFromAngle(leaf, force * 0.1, 0);
    if(leaf.rotation > Math.PI / 5){
      gameState.objData[leaf.name].floatRight = true
    }else if(leaf.rotation < Math.PI / -5){
      gameState.objData[leaf.name].floatRight = false
    }
    let floatDir = -1
    if(gameState.objData[leaf.name].floatRight){
      floatDir = 1
    }
    this.matter.applyForceFromAngle(leaf, .0005 * floatDir)
    leaf.rotation = leaf.rotation - (.02 * floatDir)
  }
  //check for game end
  if (gameState.running && Date.now() > gameState.gameEnd) {
    //stop game and disable jets
    // console.log('X: ' + orangeBall.body.velocity.x + ', Y: ' + orangeBall.body.velocity.y)
    gameState.running = false;
    startButton.setDepth(1);
    this.sound.get("StrongAir").stop(); //stops the air sound effects
    this.sound.get("BubblePop").stop();
    this.sound.get("ballBounce").stop();
    this.sound.get("waterDrop").stop();
    jets.enabled[0] = false;
    jets.enabled[1] = false;
    jets.enabled[2] = false;
    jetPressure(this, 0);
    jetPressure(this, 1);
    jetPressure(this, 2);
    baseOff[0].setDepth(1);
    baseOn[0].setDepth(-1);
    baseOff[1].setDepth(1);
    baseOn[1].setDepth(-1);
    baseOff[2].setDepth(1);
    baseOn[2].setDepth(-1);
  }
  //loop through all game objects in scene
  this.children.getChildren().forEach((gameObj) => {
    //first find airflow objects that overlap with any floatable object
    if (
      gameObj.name.startsWith("air") &&
      this.matter.overlap(gameObj, gameState.objectsArr)
    ) {
      //loop through the floatable objects to find out which one(s) are in the airflow
      gameState.objectsArr.forEach((floatObj) => {
        if (this.matter.overlap(gameObj, floatObj)) {
          //apply force to objects in airflow based on location in airflow using airflow object's local coordinate system
          //force matching angle of airflow first, doesn't get applied all the way to the end
          if (
            gameObj.getLocalPoint(floatObj.x, floatObj.y).y >
            8 + gameState.objData[floatObj.name].flowPenalty
          ) {
            this.matter.applyForceFromAngle(
              floatObj,
              0.0025 * gameState.objData[floatObj.name].airEff,
              //phaser's object rotation angles and matter physics force angles are both radians but 0 is a different direction
              gameObj.rotation - Math.PI / 2
            );
          }
          //force perpendicular to airflow angle towards center
          if (
            gameObj.getLocalPoint(floatObj.x, floatObj.y).x <
            gameObj.width / 2
          ) {
            this.matter.applyForceFromAngle(floatObj, 0.001, gameObj.rotation);
          } else {
            this.matter.applyForceFromAngle(
              floatObj,
              0.001 * gameState.objData[floatObj.name].airEff,
              gameObj.rotation - Math.PI
            );
          }
        }
      });
      //find hoops
    } else if (gameObj.name.startsWith("hoop")) {
      //determine which hoop has been found
      let hoopPos = parseInt(gameObj.name[4]);
      //loop through floatable objects - hoop position and the name of the floatable object is used to track hoop state
      gameState.objectsArr.forEach((scoreObj) => {
        //if the hoop doesn't have the object in it but did last update
        if (
          hoops.hoopState[scoreObj.name][hoopPos] !== "empty" &&
          !this.matter.overlap(scoreObj, gameObj)
        ) {
          //check to see if the object properly passed through the hoop,
          //(was not dragged at any point and left from opposite side the object entered from)
          //if so add score based on object's value, and check if high score should be updated
          //set state to empty regardless
          if (
            hoops.hoopState[scoreObj.name][hoopPos] === "enteredRight" &&
            gameObj.getLocalPoint(scoreObj.x, scoreObj.y).x < gameObj.width / 2
          ) {
            hoops.passCount += gameState.objData[scoreObj.name].scoreVal;
            scoreDisplay.text = "Score: " + hoops.passCount;
            if (hoops.passCount > gameState.highScore) {
              gameState.highScore = hoops.passCount;
              highDisplay.text = "High Score: " + gameState.highScore;
              //determine if the increase in high score has unlocked any objects
              gameState.objectsArr.forEach((unlockObj) => {
                if (
                  unlockObj.isTinted &&
                  gameState.objData[unlockObj.name].unlockAt <=
                    gameState.highScore
                ) {
                  unlockObj.clearTint();
                }
              });
            }
          } else if (
            hoops.hoopState[scoreObj.name][hoopPos] === "enteredLeft" &&
            gameObj.getLocalPoint(scoreObj.x, scoreObj.y).x > gameObj.width / 2
          ) {
            hoops.passCount += gameState.objData[scoreObj.name].scoreVal;
            scoreDisplay.text = "Score: " + hoops.passCount;
            if (hoops.passCount > gameState.highScore) {
              gameState.highScore = hoops.passCount;
              highDisplay.text = "High Score: " + gameState.highScore;
              //determine if the increase in high score has unlocked any objects
              gameState.objectsArr.forEach((unlockObj) => {
                if (
                  unlockObj.isTinted &&
                  gameState.objData[unlockObj.name].unlockAt <=
                    gameState.highScore
                ) {
                  unlockObj.clearTint();
                }
              });
            }
          }
          hoops.hoopState[scoreObj.name][hoopPos] = "empty";
          //if the hoop was empty last update and isn't now figure out what side the object
          //is entering from and if it is being dragged
        } else if (
          hoops.hoopState[scoreObj.name][hoopPos] === "empty" &&
          this.matter.overlap(scoreObj, gameObj)
        ) {
          if (scoreObj.isStatic()) {
            hoops.hoopState[scoreObj.name][hoopPos] = "drag";
          } else if (
            gameObj.getLocalPoint(scoreObj.x, scoreObj.y).x >
            gameObj.width / 2
          ) {
            hoops.hoopState[scoreObj.name][hoopPos] = "enteredRight";
          } else {
            hoops.hoopState[scoreObj.name][hoopPos] = "enteredLeft";
          }
          //detect if the ball entered the hoop properly but is now being dragged
        } else if (
          hoops.hoopState[scoreObj.name][hoopPos].startsWith("entered") &&
          scoreObj.isStatic()
        ) {
          hoops.hoopState[scoreObj.name][hoopPos] = "drag";
        }
      });
    }
  });
  
}

//create jet function, also handles airflow and base
function createJet(scene, xPos, jetPos) {
  //create air object, remove its collision, and name it
  let air = scene.matter.add
    .image(xPos, 500, "airflow", null, { isStatic: true })
    .setDepth(-1)
    .setCollisionCategory(null);
  air.name = "air" + jetPos;
  air.setScale((30 * widthScale) / air.width);
  //create jet object and name it
  let jet = scene.matter.add.image(xPos, 500, "jet", null, { isStatic: true });
  jet.setScale(((30 * widthScale) / jet.width) * 1.1);
  jet.name = "jet" + jetPos;
  //use drag rotate plugin to make jet controllable
  scene.plugins
    .get("rexdragrotateplugin")
    .add(scene, { x: xPos, y: 500, maxRadius: 120, minRadius: 0 })
    .on("drag", function (dragRotate) {
      //make sure the jet doesn't get dragged when clicking near it
      if (
        dragRotate.pointer.worldY < 500 &&
        scene.matter.intersectPoint(
          dragRotate.pointer.worldX,
          dragRotate.pointer.worldY,
          [jet]
        ).length > 0
      ) {
        let newAngle = jet.rotation + dragRotate.deltaRotation;
        //limit rotation angle of jet and keep airflow rotation matching the jet
        if (Math.abs(newAngle) < 0.7) {
          jet.rotation = newAngle;
          air.rotation = newAngle;
        }
      }
    });
  //create the base object and make it clickable
  baseOff[jetPos] = scene.add
    .image(xPos, 500, "baseOff")
    .setDepth(1)
    .setInteractive()
    .on("pointerdown", () => {
      //if the game is running toggle the associated jet and update pressure of all jets
      if (gameState.running) {
        jets.enabled[jetPos] = !jets.enabled[jetPos];
        jetPressure(scene, 0);
        jetPressure(scene, 1);
        jetPressure(scene, 2);
        baseOn[jetPos].setDepth(1);
        baseOff[jetPos].setDepth(-1);
      }
    });

  baseOn[jetPos] = scene.add
    .image(xPos, 500, "baseOn")
    .setDepth(-1)
    .setInteractive()
    .on("pointerdown", () => {
      //if the game is running toggle the associated jet and update pressure of all jets
      if (gameState.running) {
        jets.enabled[jetPos] = !jets.enabled[jetPos];
        jetPressure(scene, 0);
        jetPressure(scene, 1);
        jetPressure(scene, 2);
        baseOn[jetPos].setDepth(-1);
        baseOff[jetPos].setDepth(1);
      }
    });

  baseOff[jetPos].setScale((60 * widthScale) / baseOff[jetPos].width);
  baseOn[jetPos].setScale((60 * widthScale) / baseOn[jetPos].width);
}

//update pressure of jet
function jetPressure(scene, jetPos) {
  //if jet is not enabled, set airflow to not extend past the jet object
  if (!jets.enabled[jetPos]) {
    scene.children.getChildren().forEach((gameObj) => {
      if (gameObj.name === "air" + jetPos) {
        //briefly set rotation of air to 0 to prevent weird warping of hitbox when adjusting scale
        let currRotate = gameObj.rotation;
        gameObj.rotation = 0;
        gameObj.scaleY = (30 * widthScale) / gameObj.width;
        gameObj.rotation = currRotate;
      }
    });
  } else {
    //if jet is enabled find out how many jets are enabled total
    let enabledJets = 0;
    jets.enabled.forEach((enabledBool) => {
      if (enabledBool) {
        enabledJets++;
      }
    });
    //set air to extend by total pressure / activated jets
    scene.children.getChildren().forEach((gameObj) => {
      if (gameObj.name === "air" + jetPos) {
        let currRotate = gameObj.rotation;
        gameObj.rotation = 0;
        gameObj.scaleY =
          ((1 + jets.totalPressure / enabledJets) * 30 * widthScale) /
          gameObj.width;
        gameObj.rotation = currRotate;
      }
    });
  }
}

//create hoop
function createHoop(scene, xPos, yPos, hoopPos) {
  //create hoop image
  let hoop = scene.add.image(xPos, yPos, "hoop" + hoopPos);
  hoop.setScale((60 * widthScale) / hoop.width);
  //create half hoop object that renders on top of floatable objects
  let hoopFront = scene.add
    .image(xPos - 15, yPos - 115 + hoopPos * 23, "hoopFront")
    .setDepth(5);
  hoopFront.setScale((60 * widthScale) / hoop.width);
  //create hitbox for hoop and name it
  let hoopDetector = scene.matter.add.image(
    xPos,
    yPos - 115 + hoopPos * 23,
    "hoopOld",
    null,
    { isStatic: true }
  );
  hoopDetector.name = "hoop" + hoopPos;
  hoopDetector.setVisible(false).setCollisionCategory(null);
  //create small invisible boxes with collision for the top and bottom of the hoop
  let hoopTop = scene.matter.add.rectangle(
    xPos,
    yPos - 166 + hoopPos * 23,
    12,
    15,
    {
      isStatic: true,
    }
  );
  let hoopBottom = scene.matter.add.rectangle(
    xPos,
    yPos + 55 - hoopPos,
    12,
    240 - hoopPos * 52,
    {
      isStatic: true,
    }
  );
  return [hoop, hoopFront, hoopTop, hoopBottom, hoopDetector];
}
