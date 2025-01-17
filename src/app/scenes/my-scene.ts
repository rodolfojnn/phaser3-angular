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

  readonly THROTTLE_TIME = 60;
  readonly MAX_VELOCITY = 60;

  playerId = localStorage.getItem('playerId') || 'p1';
  get player() { return this.players[this.playerId]; }
  players: {[key: string]: Phaser.Physics.Arcade.Sprite};
  otherPlayersGroup: Phaser.Physics.Arcade.Group;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  cursors: Phaser.Input.Keyboard.CursorKeys;
  pointer: Phaser.Input.Pointer;

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

      this.pointer = this.input.activePointer;

      this.createPlayers();
      this.setupFirebase();

      this.cursors = this.input.keyboard.createCursorKeys();
      this.cameras.main.startFollow(this.player, false, 0.1, 0.1);

      this.colliders();
  }

  update() {
    // Configuração de teclas e teclado
    this.keyboard();
    // Envia data do player atual para o Firebase
    this.sendPlayerData();
  }

  private colliders() {
    this.physics.add.collider(this.player, this.otherPlayersGroup, <ArcadePhysicsCallback>(a: Phaser.Physics.Arcade.Sprite, b: Phaser.Physics.Arcade.Sprite) => {
      b.setVelocity(0);
      b.setImmovable(true);
      if (a.body.velocity.x || a.body.velocity.y) {
        // a.setScale(a.scaleX + .01, a.scaleY + .01);
      }
    });
  }

  private setupFirebase() {
    this.fbDatabase = firebase.database();
    this.fbPlayersRef = this.fbDatabase.ref('room01/players');

    this.fbplayerUpdate$.pipe(
      throttleTime(this.THROTTLE_TIME),
      filter(v => v[this.playerId])
    ).subscribe(v => {                                                  // console.log(v[this.playerId].x, v[this.playerId].y); // console.log(this.player.x.toFixed(0), this.player.y.toFixed(0));
      this.fbPlayersRef.update(v);
    })

    this.fbPlayersRef.on('value', v => this.renderPlayersInfo(v))

  }

  private renderPlayersInfo(players: DataSnapshot) {
    players.forEach(player => {                                         // console.log(player.key, player.val());
      if (!this.players || !this.players[player.key]) { return; }
      const playerKey = this.players[player.key];
      const playerVal = player.val();
      if (player.key === this.playerId && playerKey.y !== .1) { return; }
      this.tweens.timeline({
        targets: playerKey,
        ease: 'Cubic',
        duration: this.THROTTLE_TIME * 2,
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
    if (this.pointer.isDown) {
      const worldPoint = this.cameras.main.getWorldPoint(this.pointer.x, this.pointer.y);
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
      if (distance < 30) { return; }
      this.physics.moveToObject(this.player, worldPoint, (this.MAX_VELOCITY >> 5) + distance);
    }
  }

  private createPlayers() {
      this.players = {};
      this.otherPlayersGroup = this.physics.add.group();
      for (let index = 1; index < 5; index++) {
        const newPlayer = this.physics.add.sprite(50 * index, .1, 'logo');
        const id = 'p' + index;
        newPlayer.setData('id', id);
        newPlayer.setScale(.8);
        this.players[id] = newPlayer;

        // É outro player
        if (this.playerId !== id) {
          this.otherPlayersGroup.add(newPlayer);
          continue;
        }

        // É o player atual
        newPlayer.setDamping(true);
        newPlayer.setDrag(0.90);
        newPlayer.setMaxVelocity(this.MAX_VELOCITY);
      }
  }

}
