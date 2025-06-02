// Basic Phaser game configuration
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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create a new Phaser game instance
const game = new Phaser.Game(config);

// Preload game assets
function preload() {
    // TODO: Load game assets here
    this.load.image('player', 'https://www.pngwing.com/en/free-png-yklmb/download');
    this.load.image('bullet', 'https://www.pngwing.com/en/free-png-zkwfP/download'); // Placeholder bullet image
    this.load.image('enemy', 'https://www.pngwing.com/en/free-png-pccfz/download'); // Placeholder enemy image
}

// Create game objects
function create() {
    // TODO: Create game objects here
    this.player = this.physics.add.sprite(config.width / 2, config.height / 2, 'player');

    // Player movement
    this.cursors = this.input.keyboard.createCursorKeys();

    // Bullets
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Enemies
    this.enemies = this.physics.add.group();
    this.time.addEvent({
        delay: 1000, // Spawn enemy every 1 second
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true
    });

    // Collision detection
    this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);
}

// Update game logic
function update() {
    // TODO: Update game logic here
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    // Keep player within screen bounds
    if (this.player.x < this.player.width / 2) {
        this.player.x = this.player.width / 2;
    } else if (this.player.x > config.width - this.player.width / 2) {
        this.player.x = config.width - this.player.width / 2;
    }

    // Shooting
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        this.fireBullet();
    }

    // Remove bullets that go off screen
    this.bullets.children.each(function(bullet) {
        if (bullet.active && bullet.y < 0) {
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }.bind(this));
}

function fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - this.player.height / 2);

    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.velocity.y = -400;
    }
}

function spawnEnemy() {
    const x = Phaser.Math.Between(0, config.width);
    const enemy = this.enemies.create(x, 0, 'enemy');
    enemy.setVelocityY(100); // Move enemies down
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.destroy();

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.destroy();
}

function playerHit(player, enemy) {
    // Game over logic
    this.physics.pause();
    player.setTint(0xff0000); // Turn player red
    // TODO: Add game over text or screen
    this.add.text(config.width / 2, config.height / 2, 'GAME OVER', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
}
