export default class EvolutionPopup extends Phaser.GameObjects.Container {
    constructor(scene, pokemonName, pokemonSpriteUrl) {
        // Position the container in the center of the screen
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        this.scene = scene;

        this.setDepth(200); // Set a high depth to appear over everything
        scene.add.existing(this);

        // --- Create UI Elements ---

        // 1. Semi-transparent background overlay
        const overlay = scene.add.graphics()
            .fillStyle(0x000000, 0.5)
            .fillRect(-this.x, -this.y, scene.scale.width, scene.scale.height);
        this.add(overlay);

        // 2. Main white popup box with rounded corners
        const boxWidth = 420;
        const boxHeight = 350;
        const cornerRadius = 20;
        const bg = scene.add.graphics()
            .fillStyle(0xffffff, 1)
            .fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, cornerRadius);
        this.add(bg);

        // 3. Blue header bar
        const headerHeight = 60;
        const header = scene.add.graphics()
            .fillStyle(0x1DA1F2, 1) // A nice light blue color
            .fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, headerHeight, { tl: cornerRadius, tr: cornerRadius, bl: 0, br: 0 });
        this.add(header);

        // 4. "Upgrade!" text in the header
        const titleText = scene.add.text(0, -boxHeight / 2 + headerHeight / 2, 'Upgrade!', {
            fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(titleText);

        // 5. Green "X" close button
        const closeButton = this.createCloseButton(boxWidth / 2 - 35, -boxHeight / 2 + 30);
        closeButton.on('pointerdown', this.close, this);
        this.add(closeButton);

        // 6. Pokémon Name Text (placeholder, will be positioned later)
        const nameText = scene.add.text(0, 120, pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1), {
            fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#333333'
        }).setOrigin(0.5);
        this.add(nameText);

        // 7. Dynamically load and display the Pokémon sprite
        this.loadAndDisplaySprite(pokemonName, pokemonSpriteUrl);

        // --- Animate the popup entrance ---
        this.setScale(0.8);
        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    createCloseButton(x, y) {
        const container = this.scene.add.container(x, y);
        const circle = this.scene.add.graphics().fillStyle(0x2ECC71, 1).fillCircle(0, 0, 18);
        const xMark = this.scene.add.text(0, -1, '✕', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        container.add([circle, xMark]);
        container.setSize(36, 36).setInteractive({ useHandCursor: true });
        return container;
    }

    loadAndDisplaySprite(name, url) {
        const spriteKey = `evolved_${name}`;

        const addSprite = () => {
            const sprite = this.scene.add.image(0, 20, spriteKey).setScale(2.5);
            // Ensure pixel art remains sharp
            sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            this.add(sprite);
        }

        // Load the image only if it doesn't already exist
        if (this.scene.textures.exists(spriteKey)) {
            addSprite();
        } else {
            this.scene.load.image(spriteKey, url);
            this.scene.load.once('complete', addSprite);
            this.scene.load.start();
        }
    }

    close() {
        this.scene.tweens.add({
            targets: this,
            scale: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power1',
            onComplete: () => {
                this.destroy(); // This will emit the 'destroy' event
            }
        });
    }
}