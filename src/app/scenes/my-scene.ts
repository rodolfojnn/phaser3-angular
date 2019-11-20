import firebase from '@firebase/app';
import '@firebase/database';
import { FirebaseDatabase, Reference, DataSnapshot } from '@firebase/database-types';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { throttleTime, filter} from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyScene extends Phaser.Scene {

  fbDatabase: FirebaseDatabase;
  fbPlayersRef: Reference;
  fbplayerUpdate$: BehaviorSubject<any> = new BehaviorSubject({});

  throttleTime = 250;
  playerId = localStorage.getItem('playerId') || 'player-1';
  get player() { return this.players[this.playerId]; }
  players: {[key: string]: Phaser.Physics.Arcade.Image};
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  cursors: Phaser.Input.Keyboard.CursorKeys;

  constructor() {
    super({key: 'Scene'});
  }

  preload() {
      this.load.image('sky', 'https://labs.phaser.io/assets//textures/tiles.jpg');
      this.load.image('logo', 'https://labs.phaser.io/assets/sprites/32x32.png');
      this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
      this.load.image('otherPlayer', './assets/otherPlayer.png')
  }

  create() {
      this.add.image(400, 300, 'sky');

      this.createPlayers();
      this.setupFirebase();

      this.cursors = this.input.keyboard.createCursorKeys();

      this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
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

    this.fbplayerUpdate$.pipe(
      throttleTime(this.throttleTime),
      filter(v => v[this.playerId])
    ).subscribe(v => {                                                  // console.log(v[this.playerId].x, v[this.playerId].y); // console.log(this.player.x.toFixed(0), this.player.y.toFixed(0));
      this.fbPlayersRef.update(v);
    })

    this.fbPlayersRef.on('value', v => this.renderPlayersInfo(v))

  }

  private renderPlayersInfo(players: DataSnapshot) {
    players.forEach(player => {                                         console.log(player.key, player.val());
      if (!this.players || !this.players[player.key]) { return; }
      const playerKey = this.players[player.key];
      const playerVal = player.val();
      if (player.key === this.playerId && playerKey.x !== .1) { return; }
      this.tweens.timeline({
        targets: playerKey,
        ease: 'Cubic',
        duration: this.throttleTime * 2,
        tweens: [{x: playerVal.x, y: playerVal.y}]
      });
    });
  }

  private sendPlayerData() {
    if (!this.player.body.velocity.x && !this.player.body.velocity.y) { return; }

    const playersData = {};
    playersData[this.player.getData('id')] = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    this.fbplayerUpdate$.next(playersData)
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

  private createPlayers() {
      this.players = {};
      for (let index = 1; index < 5; index++) {
        const id = 'player-' + index;
        const newPlayer = this.physics.add.image(.1, .1, 'logo');
        newPlayer.setDamping(true);
        newPlayer.setDrag(0.95);
        newPlayer.setMaxVelocity(150);
        newPlayer.setData('id', id);
        this.players[id] = newPlayer;
      }

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

  private testPosition(playerA, playerB) {
    if (!playerA) return false;
    console.log(playerA.x, Math.round(playerB.x));
    return playerA && playerA.x !== Math.round(playerB.x) && playerA.y !== Math.round(playerB.y);
  }

}
