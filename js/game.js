class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // TODO: Replace placeholder assets with locally hosted images to avoid CORS issues and improve reliability.
        // These assets are loaded from an external source and might not always be available or could be changed.
        // Ensure you have player.png, bullet.png, and enemy.png in the 'assets' directory.
        this.load.image('player', 'assets/player.png');
        this.load.image('bullet', 'assets/bullet.png'); // Will be repurposed or removed later
        this.load.image('enemy', 'assets/enemy.png');   // Will be repurposed or removed later

        // New scenery assets
        this.load.image('tree', 'assets/tree.png');
        this.load.image('water', 'assets/water.png');

        // Inventory Item Assets
        this.load.image('item_tent', 'assets/item_tent.png');
        this.load.image('item_axe', 'assets/item_axe.png');
        this.load.image('item_bow', 'assets/item_bow.png');
        this.load.image('item_arrows', 'assets/item_arrows.png');
    }

    create() {
        // Initialize Inventory
        this.inventory = [];
        this.inventoryVisible = false; // For toggling UI later

        // Define default items
        const defaultItems = [
            { id: 'tent', name: 'Tent', quantity: 1, assetKey: 'item_tent', description: 'A basic shelter.' },
            { id: 'camp_axe', name: 'Camp Axe', quantity: 1, assetKey: 'item_axe', description: 'For chopping wood.' },
            { id: 'bow', name: 'Bow', quantity: 1, assetKey: 'item_bow', description: 'For hunting.' },
            { id: 'arrows', name: 'Arrows', quantity: 10, assetKey: 'item_arrows', description: 'Ammunition for the bow.' }
        ];

        // Populate inventory with default items
        defaultItems.forEach(item => {
            this.inventory.push(item);
        });

        // Attempt to set willReadFrequently for the main canvas context
        if (this.game.canvas) {
            const context = this.game.canvas.getContext('2d');
            if (context) {
                context.canvas.willReadFrequently = true;
            }
        }

        const worldWidth = 1600;
        const worldHeight = 1200;

        // Set world bounds
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Player setup should be before camera follow
        this.player = this.physics.add.sprite(600, 450, 'player'); // Start player at (600, 450)

        // Setup WASD keys
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I); // Inventory key

        // Camera setup
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // roundPixels, lerpX, lerpY
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Inventory UI Container
        this.inventoryContainer = this.add.container(50, 50);
        this.inventoryContainer.setScrollFactor(0); // Fixes it to the camera
        this.inventoryContainer.setVisible(false);

        // this.bullets = this.physics.add.group({
        //     defaultKey: 'bullet',
        //     maxSize: 10
        // });
        // this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // this.enemies = this.physics.add.group();
        // this.time.addEvent({
        //     delay: 1000,
        //     callback: this.spawnEnemy,
        //     callbackScope: this,
        //     loop: true
        // });
        // this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        // this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);

        // Add some trees
        this.add.image(300, 300, 'tree');
        this.add.image(400, 350, 'tree');
        this.add.image(350, 400, 'tree');

        // Add a small lake (2x2 tiles)
        // Assuming water tiles are 32x32 for positioning
        const waterTileSize = 32;
        this.add.image(700, 500, 'water');
        this.add.image(700 + waterTileSize, 500, 'water');
        this.add.image(700, 500 + waterTileSize, 'water');
        this.add.image(700 + waterTileSize, 500 + waterTileSize, 'water');
    }

    update() {
        let velocityX = 0;
        let velocityY = 0;
        const speed = 200; // Player speed

        if (this.keyA.isDown) {
            velocityX = -speed;
        } else if (this.keyD.isDown) {
            velocityX = speed;
        }

        if (this.keyW.isDown) {
            velocityY = -speed;
        } else if (this.keyS.isDown) {
            velocityY = speed;
        }

        this.player.setVelocity(velocityX, velocityY);

        // Screen boundary logic - Player is now constrained by world bounds, not screen bounds.
        // The camera will handle showing the correct part of the world.
        // So, the old screen boundary logic for player.x and player.y can be removed.
        // Player's movement is naturally constrained by physics world bounds.
        // If we want additional constraints (e.g. player can't go to very edge of world), that would be different.

        // Inventory Toggle Logic
        if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
            this.inventoryVisible = !this.inventoryVisible; // Toggle the flag

            if (this.inventoryVisible) {
                this.refreshInventoryDisplay(); // Refresh content before showing
                this.inventoryContainer.setVisible(true);
            } else {
                this.inventoryContainer.setVisible(false);
            }
        }

        // if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        //     this.fireBullet();
        // }

        // this.bullets.children.each(function(bullet) {
        //     if (bullet.active && bullet.y < 0) {
        //         bullet.setActive(false);
        //         bullet.setVisible(false);
        //         bullet.destroy(); // Destroy bullet when it goes off screen
        //     }
        // }.bind(this));
    }

    // fireBullet() {
    //     const bullet = this.bullets.get(this.player.x, this.player.y - this.player.height / 2);
    //     if (bullet) {
    //         bullet.setActive(true);
    //         bullet.setVisible(true);
    //         bullet.body.velocity.y = -400;
    //     }
    // }

    // spawnEnemy() {
    //     const x = Phaser.Math.Between(0, this.game.config.width);
    //     const enemy = this.enemies.create(x, 0, 'enemy');
    //     enemy.setVelocityY(100);
    // }

    // hitEnemy(bullet, enemy) {
    //     bullet.setActive(false);
    //     bullet.setVisible(false);
    //     bullet.destroy();
    //
    //     enemy.setActive(false);
    //     enemy.setVisible(false);
    //     enemy.destroy();
    // }

    // playerHit(player, enemy) { // This method will be modified/removed in a subsequent step
    //     this.physics.pause();
    //     player.setTint(0xff0000);
    //     this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'GAME OVER', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    // }

    refreshInventoryDisplay() {
        // Clear existing items in the container
        this.inventoryContainer.removeAll(true);

        // Define some layout constants
        const padding = 10;
        const iconSize = 32; // Assuming most icons are 32x32, adjust if needed
        const textOffsetY = 8; // Offset for text to align nicely with icons
        let currentY = padding;
        let maxWidth = 200; // Initial minimum width for the background

        // Add a background
        // We'll calculate the height based on content later and add the background last,
        // or add it first and resize, or use a 9-slice. For simplicity, fixed size for now.
        // Let's estimate a height for up to 5 items initially.
        const estimatedBgHeight = padding + (5 * (iconSize + padding)) ;
        const bg = this.add.rectangle(0, 0, maxWidth, estimatedBgHeight, 0x000000, 0.7).setOrigin(0,0);
        this.inventoryContainer.add(bg); // Add background first

        if (this.inventory.length === 0) {
            const emptyText = this.add.text(padding, currentY, 'Inventory is empty.', { fontSize: '16px', fill: '#fff' });
            this.inventoryContainer.add(emptyText);
            currentY += emptyText.height + padding;
        } else {
            this.inventory.forEach(item => {
                // Add item icon
                const itemImage = this.add.image(padding, currentY, item.assetKey).setOrigin(0,0);
                this.inventoryContainer.add(itemImage);

                // Add item text (name and quantity)
                const itemText = this.add.text(
                    padding + itemImage.width + padding, // Position text next to icon
                    currentY + textOffsetY,
                    `${item.name} (x${item.quantity})`,
                    { fontSize: '16px', fill: '#fff' }
                );
                this.inventoryContainer.add(itemText);

                // Update currentY for the next item
                currentY += Math.max(itemImage.height, itemText.height) + padding;

                // Adjust background width if text is wider
                let currentItemWidth = padding + itemImage.width + padding + itemText.width + padding;
                if (currentItemWidth > maxWidth) {
                    maxWidth = currentItemWidth;
                }
            });
        }

        // Resize background to fit content
        bg.setSize(maxWidth, currentY);
        // If you want to ensure all items are added on top of bg, you might need to re-add bg or manage depth.
        // A simpler way: add bg first with a large enough estimated size, or fixed size.
        // The current approach of resizing after adding elements might mean bg is drawn on top of some things if not careful.
        // To fix, ensure bg is at index 0 of container:
        this.inventoryContainer.sendToBack(bg);


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
    scene: [GameScene] // Use the class here
};

const game = new Phaser.Game(config);
