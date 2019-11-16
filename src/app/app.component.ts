import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MyScene } from './scenes/my-scene';

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
