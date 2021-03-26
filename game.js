// start button attribution <a href='https://pngtree.com/so/play'>play png from pngtree.com</a>



//setup phaser
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

//load assets and plugins
function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("jet", "assets/jet.png");
  this.load.image("ball", "assets/orangeBall.png");
  this.load.image("airflow", "assets/airflow.png");
  this.load.image("base", "assets/base.png");
  this.load.image("button", "assets/button.png");
  this.load.image("hoop", "assets/hoop.png");
  this.load.image("hoopFront", "assets/hoopFront.png");
  

  this.load.plugin(
    "rexdragrotateplugin",
    "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragrotateplugin.min.js",
    true
  );
}
//global variables
//game objects
let startButton;
let button;
let ground;
let orangeBall;
let ball2;
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
  objectsArr: []
};


//create function, phaser calls it once when setting up
function create() {
  //create background, ground, and set world bounds
  this.add.image(400, 300, "background").setDepth(-5);
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);
  ground = this.matter.add
    .image(400, 550, "ground", null, { isStatic: true })
    .setDepth(1);
  
  //create jets and hoops
  createJet(this, 130, 0);
  createJet(this, 400, 1);
  createJet(this, 670, 2);
  createHoop(this, 265, 175, 0);
  createHoop(this, 535, 225, 1);

  //create floatable objects
  orangeBall = this.matter.add.image(850, 200, "ball", null, {
    friction: 0.5,
    restitution: 0.5,
    shape: "circle",
  });
  orangeBall.setInteractive();
  orangeBall.name = 'ballA'
  this.input.setDraggable(orangeBall);
  ball2 = this.matter.add.image(850, 180, "ball", null, {
    friction: 0.5,
    restitution: 0.5,
    shape: "circle",
  });
  ball2.setInteractive();
  ball2.name = 'ballB'
  this.input.setDraggable(ball2);

  //drag events
  this.input.on("drag", (pointer, gameObject, x, y) =>
    gameObject.setPosition(x, y)
  );
  this.input.on("dragstart", (pointer, gameObject) =>
    gameObject.setStatic(true)
  );
  this.input.on("dragend", (pointer, gameObject) =>
    gameObject.setStatic(false)
  );

  //add floatable objects to gameState's array
  gameState.objectsArr.push(orangeBall)
  gameState.objectsArr.push(ball2)

  //use gameState's array to populate hoopState
  gameState.objectsArr.forEach((gameObj) => {
    hoops.hoopState[gameObj.name] = ['empty' , 'empty']
  })

  //setup start button
  startButton = this.add
    .image(850, 30, "button")
    .setInteractive()
    .on("pointerdown", () => {
      //when clicking the start button,
      //if the game is running do nothing,
      //otherwise start the game, turn on the jets, reset the score and set the time when the game will end
      if (!gameState.running) {
        gameState.running = true;
        jets.enabled[0] = true;
        jets.enabled[1] = true;
        jets.enabled[2] = true;
        jetPressure(this, 0);
        jetPressure(this, 1);
        jetPressure(this, 2);
        hoops.passCount = 0;
        gameState.gameEnd = Date.now() + 25000;
      }
    });
  startButton.setScale(0.09).setSize(200, 200);
}

//update function, runs repeatedly while phaser is loaded
function update() {
  //check for game end
  if (gameState.running && Date.now() > gameState.gameEnd) {
    //stop game and disable jets
    gameState.running = false;
    jets.enabled[0] = false;
    jets.enabled[1] = false;
    jets.enabled[2] = false;
    jetPressure(this, 0);
    jetPressure(this, 1);
    jetPressure(this, 2);
    console.log("Your score was " + hoops.passCount);
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
        if(this.matter.overlap(gameObj, floatObj)){
          //apply force to objects in airflow based on location in airflow using airflow object's local coordinate system
          //force matching angle of airflow first, doesn't get applied all the way to the end
          if (gameObj.getLocalPoint(floatObj.x, floatObj.y).y > 8) {
            this.matter.applyForceFromAngle(
              floatObj,
              0.0025,
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
              0.001,
              gameObj.rotation - Math.PI
            );
          }
        }
      })
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
          //if so add a point, set state to empty regardless
          if (
            hoops.hoopState[scoreObj.name][hoopPos] === "enteredRight" &&
            gameObj.getLocalPoint(scoreObj.x, scoreObj.y).x <
              gameObj.width / 2
          ) {
            hoops.passCount += 1;
          } else if (
            hoops.hoopState[scoreObj.name][hoopPos] === "enteredLeft" &&
            gameObj.getLocalPoint(scoreObj.x, scoreObj.y).x >
              gameObj.width / 2
          ) {
            hoops.passCount += 1;
          }
          console.log(hoops.passCount);
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
      })
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
  air.scaleY = 1;
  // air.setVisible(false)
  //create jet object and name it
  let jet = scene.matter.add
    .image(xPos, 500, "jet", null, { isStatic: true })
    .setScale(1.1);
  jet.name = "jet" + jetPos;
  //use drag rotate plugin to make jet controllable
  scene.plugins
    .get("rexdragrotateplugin")
    .add(scene, { x: xPos, y: 500, maxRadius: 120, minRadius: 0 })
    .on("drag", function (dragRotate) {
      //make sure the jet doesn't get dragged when clicking near it
      if (
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
  let base = scene.add
    .image(xPos, 500, "base")
    .setDepth(1)
    .setInteractive()
    .on("pointerdown", () => {
      //if the game is running toggle the associated jet and update pressure of all jets
      if (gameState.running) {
        jets.enabled[jetPos] = !jets.enabled[jetPos];
        jetPressure(scene, 0);
        jetPressure(scene, 1);
        jetPressure(scene, 2);
      }
    });
  return [jet, air, base,];
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
        gameObj.scaleY = 1;
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
        gameObj.scaleY = 1 + jets.totalPressure / enabledJets;
        gameObj.rotation = currRotate;
      }
    });
  }
}

//create hoop
function createHoop(scene, xPos, yPos, hoopPos) {
  //create primary hoop object, remove collision and name it
  let hoop = scene.matter.add
    .image(xPos, yPos, "hoop", null, { isStatic: true })
    .setCollisionCategory(null);
  hoop.name = "hoop" + hoopPos;
  //create half hoop object that renders on top of floatable objects
  let hoopFront = scene.add.image(xPos - 16, yPos, "hoopFront").setDepth(5);
  //create small invisible boxes with collision for the top and bottom of the hoop
  let hoopTop = scene.matter.add.rectangle(xPos, yPos - 54, 12, 8, {
    isStatic: true,
  });
  let hoopBottom = scene.matter.add.rectangle(xPos, yPos + 54, 12, 8, {
    isStatic: true,
  });
  return [hoop, hoopFront, hoopTop, hoopBottom];
}
