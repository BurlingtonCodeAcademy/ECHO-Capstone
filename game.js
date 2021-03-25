//Orange Ball attributes
// cartoon ball PNG Designed By 588ku from <a href="https://pngtree.com">Pngtree.com</a>
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
  enabled: [true, true, true],
};
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

  var button = this.add.image(850, 30, "button")
  button.setScale(.09).setSize(200,200)

  startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
startButton.anchor.set(0.5);

function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}
}

function update() {
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
    }
  });
}

function createJet(scene, xPos, jetPos) {
  let air = scene.matter.add
    .image(xPos, 500, "airflow", null, { isStatic: true })
    .setDepth(-1)
    .setCollisionCategory(null);
  air.name = "air" + jetPos;
  air.scaleY = 2;
  //air.setVisible(false)
  let jet = scene.matter.add
    .image(xPos, 500, "jet", null, { isStatic: true })
    .setScale(1.1); //.setOrigin(.5,1)//.setInteractive()
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
      jets.enabled[jetPos] = !jets.enabled[jetPos];
      jetPressure(scene, 0);
      jetPressure(scene, 1);
      jetPressure(scene, 2);
    });
  return [jet, air, base];
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


