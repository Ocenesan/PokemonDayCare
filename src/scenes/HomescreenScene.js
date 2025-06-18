export default class HomescreenScene extends Phaser.Scene {
    constructor() {
        super('Homescreen');
    }

    // Fungsi preload() untuk memuat aset sebelum scene dimulai
    preload() {
        // Path 'assets/...' karena kita menaruhnya di folder public
        this.load.image('homescreen-bg', 'assets/images/background.jpg'); 
        this.load.image('startButton', 'assets/images/icons/Hover.png');
        this.load.image('title', 'assets/images/title.png');
    }

    create() {
        // --- 1. Buat Semua Elemen Game ---
        // Latar Belakang
        this.background = this.add.image(0, 0, 'homescreen-bg').setOrigin(0.5, 0.5);
        // Judul Game
        this.title = this.add.image(0, 0, 'title').setOrigin(0.5, 0.5);

        // Tombol Start (dibuat dari gambar aset)
        this.startButton = this.add.image(0, 0, 'startButton')
            .setOrigin(0.5, 0.5)
            .setInteractive({ cursor: 'pointer' });

        // Teks Petunjuk di Bawah Tombol
        this.pressStartText = this.add.text(0, 0, 'Press Start to Play', {
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);


        // --- 2. Atur Event Handling ---

        // Event saat tombol start ditekan
        this.startButton.on('pointerdown', () => {
            this.tweens.add({
                targets: this.startButton,
                scale: 0.95,
                ease: 'Power1',
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.start('ChoosePokemonScene');
                }
            });
        });

        // Event untuk hover effect
        this.startButton.on('pointerover', () => {
            this.tweens.add({ targets: this.startButton, scale: 1.05, duration: 100 });
        });
        this.startButton.on('pointerout', () => {
            this.tweens.add({ targets: this.startButton, scale: 1, duration: 100 });
        });


        // --- 3. Posisikan Elemen dan Siapkan untuk Resize ---

        this.repositionElements();
        this.scale.on('resize', this.repositionElements, this);
    }

    repositionElements() {
        const { width, height } = this.scale;

        // Posisikan Latar Belakang
        this.background.setPosition(width / 2, height / 2);
        const scaleXBg = width / this.background.width;
        const scaleYBg = height / this.background.height;
        this.background.setScale(Math.max(scaleXBg, scaleYBg));

        // Posisikan Judul
        this.title.setPosition(width / 2, height * 0.28);
        this.title.setScale(width / 1200);

        // Posisikan Tombol Start
        this.startButton.setPosition(width / 2, height * 0.75);

        // Posisikan Teks Petunjuk
        // Kita perlu menghitung posisi di bawah tombol setelah diskalakan
        const buttonBottom = this.startButton.y + (this.startButton.displayHeight / 2);
        this.pressStartText.setPosition(width / 2, buttonBottom + 20); // Beri jarak 20px
    }
}