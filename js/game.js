class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // TODO: Replace placeholder assets with locally hosted images to avoid CORS issues and improve reliability.
        // These assets are loaded from an external source and might not always be available or could be changed.
        this.load.image('player', 'https://www.pngwing.com/en/free-png-yklmb/download'); // Example placeholder
        this.load.image('bullet', 'https://www.pngwing.com/en/free-png-zkwfP/download'); // Example placeholder
        this.load.image('enemy', 'https://www.pngwing.com/en/free-png-pccfz/download'); // Example placeholder
    }

    create() {
        this.player = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'player');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enemies = this.physics.add.group();
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.player.x < this.player.width / 2) {
            this.player.x = this.player.width / 2;
        } else if (this.player.x > this.game.config.width - this.player.width / 2) {
            this.player.x = this.game.config.width - this.player.width / 2;
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.fireBullet();
        }

        this.bullets.children.each(function(bullet) {
            if (bullet.active && bullet.y < 0) {
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.destroy(); // Destroy bullet when it goes off screen
            }
        }.bind(this));
    }

    fireBullet() {
        const bullet = this.bullets.get(this.player.x, this.player.y - this.player.height / 2);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.velocity.y = -400;
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, this.game.config.width);
        const enemy = this.enemies.create(x, 0, 'enemy');
        enemy.setVelocityY(100);
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();

        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
    }

    playerHit(player, enemy) {
        this.physics.pause();
        player.setTint(0xff0000);
        this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'GAME OVER', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    render: {
        canvasAttributes: {
            willReadFrequently: true
        }
    },
    scene: [GameScene] // Use the class here
};

const game = new Phaser.Game(config);
