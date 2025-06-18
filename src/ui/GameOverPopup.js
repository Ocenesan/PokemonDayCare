export default class GameOverPopup extends Phaser.GameObjects.Container {
    constructor(scene, title, message, subMessage) {
        // Posisikan container di tengah layar
        super(scene, scene.scale.width / 2, scene.scale.height / 2);

        this.scene = scene;

        // Set depth yang sangat tinggi agar selalu di atas
        this.setDepth(200);

        // Tambahkan container ini ke scene
        scene.add.existing(this);

        // --- Mulai membuat elemen UI ---

        // 1. Lapisan overlay gelap di belakang popup
        const overlay = scene.add.graphics()
            .fillStyle(0x000000, 0.6)
            .fillRect(-this.x, -this.y, scene.scale.width, scene.scale.height);
        this.add(overlay);

        // 2. Background putih dengan sudut melengkung
        const boxWidth = 450;
        const boxHeight = 300;
        const bg = scene.add.graphics()
            .fillStyle(0xffffff, 1)
            .fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 20);
        this.add(bg);

        // 3. Header merah dengan gambar 'GAME OVER'
        const headerHeight = 60;
        const header = scene.add.graphics()
            .fillStyle(0xd40000, 1) // Warna merah
            .fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, headerHeight, { tl: 20, tr: 20, bl: 0, br: 0 });
        this.add(header);

        const gameOverTitle = scene.add.image(0, -boxHeight / 2 + headerHeight / 2, 'gameoverTitle').setScale(0.8);
        this.add(gameOverTitle);

        // 4. Tombol Close (X)
        const closeButton = scene.add.image(boxWidth / 2 - 30, -boxHeight / 2 + 30, 'closeButton')
            .setScale(0.6).setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', this.closeAndRestart, this);
        this.add(closeButton);

        // 5. Teks Pesan
        const messageStyle = { fontFamily: 'Arial', fontSize: '24px', color: '#333', align: 'center', wordWrap: { width: boxWidth - 40 } };
        const subMessageStyle = { fontFamily: 'Arial', fontSize: '18px', color: '#555', align: 'center', wordWrap: { width: boxWidth - 40 } };

        const messageText = scene.add.text(0, -30, message, messageStyle).setOrigin(0.5);
        this.add(messageText);
        
        const subMessageText = scene.add.text(0, 20, subMessage, subMessageStyle).setOrigin(0.5);
        this.add(subMessageText);
        
        // 6. Tombol Restart
        const restartButton = scene.add.image(0, 100, 'restartButton').setScale(0.7).setInteractive({ cursor: 'pointer' });
        restartButton.on('pointerdown', this.closeAndRestart, this);
        this.add(restartButton);

        // --- Animasi saat muncul ---
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

    closeAndRestart() {
        this.scene.tweens.add({
            targets: this,
            scale: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power1',
            onComplete: () => {
                // Hancurkan semua UI dan reset state
                this.scene.playerPet.destroy();
                
                // Kembali ke scene awal (Homescreen)
                this.scene.scene.start('Homescreen');
                
                this.destroy();
            }
        });
    }
}