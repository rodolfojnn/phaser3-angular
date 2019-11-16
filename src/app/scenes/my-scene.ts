import firebase from '@firebase/app';
import '@firebase/database';
import { FirebaseDatabase, Reference } from '@firebase/database-types';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { throttleTime} from 'rxjs/operators';

export class MyScene extends Phaser.Scene {

  fbDatabase: FirebaseDatabase;
  fbPlayersRef: Reference;
  fbplayersUpdate$: BehaviorSubject<any> = new BehaviorSubject({});

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
    // Configuração de teclas e teclado
    this.keyboard();
    // Envia data do player atual para o Firebase
    this.sendPlayerData();
  }

  private setupFirebase() {
    this.fbDatabase = firebase.database();
    this.fbPlayersRef = this.fbDatabase.ref('room01/players');

    this.fbplayersUpdate$
      .pipe(
        throttleTime(500)
      )
      .subscribe(v => {
        this.fbPlayersRef.update(v);
      })

    this.fbPlayersRef.on('value', v => {
      console.log(v.val());
    });

  }

  private sendPlayerData() {
    if (!this.player.body.velocity.x && !this.player.body.velocity.y) { return; }

    const playersData = {};
    playersData[this.player.getData('id')] = {
      x: this.player.x.toFixed(0),
      y: this.player.y.toFixed(0)
    };
    this.fbplayersUpdate$.next(playersData)
  }

  private keyboard() {
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

      this.player.setData('id', localStorage.getItem('playerId') || Date.now());

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
