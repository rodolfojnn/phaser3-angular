import firebase from '@firebase/app';
import '@firebase/database';
import { FirebaseDatabase } from '@firebase/database-types';

export class MyScene extends Phaser.Scene {

  database: FirebaseDatabase;
  player: Phaser.Physics.Arcade.Image;
  players: Phaser.Physics.Arcade.Image[];
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  cursors: Phaser.Input.Keyboard.CursorKeys;

  constructor() {
    super({key: 'Scene'});
  }

  preload() {
      this.load.setBaseURL('https://labs.phaser.io');
      this.load.image('sky', 'assets//textures/tiles.jpg');
      this.load.image('logo', 'assets/sprites/32x32.png');
      this.load.image('red', 'assets/particles/red.png');
  }

  create() {
      this.add.image(400, 300, 'sky');

      this.createPlayer();

      this.cursors = this.input.keyboard.createCursorKeys();

      this.cameras.main.startFollow(this.player, false, 0.1, 0.1);

      this.setupFirebase();
  }

  update() {
    this.processKeyboard();
  }

  private setupFirebase() {
    this.database = firebase.database();
    const playersRef = this.database.ref('room01/players');

    const playersData = {};
    playersData[this.player.getData('id')] = {position: {x:1, y:2}};
    playersRef.set(playersData);

    playersRef.on('value', v => {
      console.log(v.val());
    });

  }

  private processKeyboard() {
    this.player.setAcceleration(0);

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-500);
    }
    if (this.cursors.right.isDown) {
      this.player.setAccelerationX(500);
    }
    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-500);
    }
    if (this.cursors.down.isDown) {
      this.player.setAccelerationY(500);
    }
  }

  private createPlayer() {
      this.player = this.physics.add.image(400, 100, 'logo');
      this.player.setDamping(true);
      this.player.setDrag(0.95);
      this.player.setMaxVelocity(150);
      this.player.setData('id', Date.now());
      /*
      const particles = this.add.particles('red');
      this.emitter = particles.createEmitter({
          speed: 10,
          scale: { start: 1, end: 0 },
          blendMode: Phaser.BlendModes.ADD
      });
      this.emitter.startFollow(this.player);
      */
  }

}
