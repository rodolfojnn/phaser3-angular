export class MyScene extends Phaser.Scene {

  logo: Phaser.Physics.Arcade.Image;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  cursors: Phaser.Input.Keyboard.CursorKeys;

  constructor() {
      super({key: 'Scene'});
  }

  preload() {
      this.load.setBaseURL('https://labs.phaser.io');
      this.load.image('sky', 'assets/skies/space3.png');
      this.load.image('logo', 'assets/sprites/32x32.png');
      this.load.image('red', 'assets/particles/red.png');
  }

  create() {
      this.add.image(400, 300, 'sky');

      const particles = this.add.particles('red');

      this.logo = this.physics.add.image(400, 100, 'logo');
      this.logo.setBounce(.6);
      this.logo.setCollideWorldBounds(true);
      this.logo.setDamping(true);
      this.logo.setDrag(0.95);
      this.logo.setMaxVelocity(100);

      this.emitter = particles.createEmitter({
          speed: 10,
          scale: { start: 1, end: 0 },
          blendMode: Phaser.BlendModes.ADD
      });
      this.emitter.startFollow(this.logo);

      this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.processKeyboard();
  }

  private processKeyboard() {
    if (this.cursors.left.isDown) {
      this.logo.setAccelerationX(-100);
    }
    if (this.cursors.right.isDown) {
      this.logo.setAccelerationX(100);
    }
    if (this.cursors.up.isDown) {
      this.logo.setAccelerationY(-100);
    }
    if (this.cursors.down.isDown) {
      this.logo.setAccelerationY(100);
    }
    if (this.cursors.down.isUp && this.cursors.up.isUp && this.cursors.left.isUp && this.cursors.right.isUp) {
      this.logo.setAcceleration(0);
    }

  }

}
