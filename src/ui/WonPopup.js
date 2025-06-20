// src/ui/WonPopup.js

export default class WonPopup extends Phaser.GameObjects.Container {
    constructor(scene, pokemonName) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        this.scene = scene;

        this.setDepth(200); // Appear on top of everything
        scene.add.existing(this);

        // --- Create UI Elements ---
        const boxWidth = 450;
        const boxHeight = 250;
        const cornerRadius = 20;

        // 1. Background overlay
        const overlay = scene.add.graphics().fillStyle(0x000000, 0.5).fillRect(-this.x, -this.y, scene.scale.width, scene.scale.height);
        this.add(overlay);

        // 2. Main white popup box
        const bg = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, cornerRadius);
        this.add(bg);

        // 3. Title Text
        const titleText = scene.add.text(0, -boxHeight/2 + 40, 'Congratulations!', {
            fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#333', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(titleText);
        
        // 4. Message Text
        const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
        const messageText = scene.add.text(0, -boxHeight/2 + 90, `${capitalizedName} has reached its final form!`, {
            fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#555', align: 'center'
        }).setOrigin(0.5);
        this.add(messageText);

        // 5. Create Buttons
        const continueButton = this.createButton(boxWidth / 4, 60, 'Continue', '#2ecc71');
        const replayButton = this.createButton(-boxWidth / 4, 60, 'Replay', '#3498db');
        
        continueButton.on('pointerdown', () => this.close());
        replayButton.on('pointerdown', () => {
            this.scene.scene.start('HomescreenScene');
        });

        this.add([continueButton, replayButton]);

        // --- Animate Entrance ---
        this.setScale(0.8).setAlpha(0);
        scene.tweens.add({
            targets: this, scale: 1, alpha: 1, duration: 300, ease: 'Power2'
        });
    }

    createButton(x, y, text, color) {
        const button = this.scene.add.container(x, y);
        const bg = this.scene.add.graphics().fillStyle(Phaser.Display.Color.HexStringToColor(color).color).fillRoundedRect(-70, -22, 140, 44, 15);
        const label = this.scene.add.text(0, 0, text, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        button.add([bg, label]);
        button.setSize(140, 44).setInteractive({ useHandCursor: true });
        return button;
    }

    close() {
        this.scene.tweens.add({
            targets: this,
            scale: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power1',
            onComplete: () => {
                this.destroy(); // This emits the 'destroy' event for the scene to listen to
            }
        });
    }
}