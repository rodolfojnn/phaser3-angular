import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MyScene } from './scenes/my-scene';
import firebase from '@firebase/app';

@Component({
  selector: 'app-root',
  template: '<div id="content"></div>'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'angular-phaser';

  game: Phaser.Game;

  public readonly gameConfig: GameConfig = {
    type: Phaser.AUTO,
    width: 480,
    height: 440,
    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },
    parent: 'content',
  };

  constructor() {}

  ngOnInit(): void {
    this.game = new Phaser.Game(this.gameConfig);

    // Init firebase
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyDscgs_aAtCXi7sKxaXI0rbOtP5RNMJ5rQ',
        authDomain: 'game01-f2203.firebaseapp.com',
        databaseURL: 'https://game01-f2203.firebaseio.com',
        projectId: 'game01-f2203',
        storageBucket: 'game01-f2203.appspot.com',
        messagingSenderId: '366192979180',
        appId: '1:366192979180:web:6b6f802db9284f4eabc9c9'
      });
    }
  }

  ngOnDestroy() {
    this.game.destroy(true);
  }

  ngAfterViewInit() {
    this.game.events.once('ready', () => {
      this.game.scene.add('Scene', MyScene, true);
    });
  }

}
