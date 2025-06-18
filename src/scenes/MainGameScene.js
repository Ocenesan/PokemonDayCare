import Pet from '../game/Pet.js';

export default class MainGameScene extends Phaser.Scene {
    constructor() {
        super('MainGameScene');
        this.playerPet = null;
        this.ui = {};
    }

    preload() {
        this.load.image('game-bg', 'assets/images/bgpokemon.png');
        this.load.image('feedButton', 'assets/images/icons/btn-feed.png');
        this.load.image('sleepButton', 'assets/images/icons/btn-sleep.png');
        this.load.image('trainingButton', 'assets/images/icons/btn-training.png');
        this.load.image('playButton', 'assets/images/icons/btn-play.png');
        this.load.image('fullStatusBar', 'assets/images/icons/full-bar.png');
        this.load.image('emptyStatusBar', 'assets/images/icons/empty-bar.png');
        this.load.image('profileIcon', 'assets/images/icons/profile.png');
        this.load.image('bagIcon', 'assets/images/icons/bag.png');
        this.load.image('homeIcon', 'assets/images/icons/home.png');
        this.load.image('popup-box', 'assets/images/icons/option.png');
    }

    create() {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'game-bg');
        const pokemonRegistryData = this.registry.get('playerPokemon');

        if (!pokemonRegistryData) {
            this.add.text(this.scale.width/2, this.scale.height/2, 'No Pokémon data found.').setOrigin(0.5);
            return;
        }

        // --- Inisialisasi Pet dan UI ---
        this.playerPet = new Pet(this, 0, 0, pokemonRegistryData);
        this.createUI();
        this.repositionUI();
        this.updateUI(this.playerPet.stats);

        // --- Event Listeners ---
        this.scale.on('resize', this.repositionUI, this);
        this.playerPet.on('onStatChange', this.updateUI, this);
        this.playerPet.on('onLevelUp', (level) => this.ui.levelText.setText(`Level ${level}`), this);
        this.playerPet.on('onFaint', (reason) => this.showGameOverPopup('Fainted!', reason), this);
        this.playerPet.on('onRunAway', (reason) => this.showGameOverPopup('Ran Away!', reason), this);
        this.playerPet.on('onEvolve', (data) => this.showEvolutionPopup(data), this);
    }

    // --- Fungsi Pembuatan UI ---
    createUI() {
        // Status Bars
        this.ui.statusBars = {};
        const statusKeys = ['TIRED', 'HUNGER', 'BOREDOM'];
        statusKeys.forEach((status, index) => { // Tambahkan 'index' di sini
            const label = this.add.text(0, 0, `${status}: 100`, { 
                fontSize: '16px', 
                fontFamily: 'Arial',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            const emptyBar = this.add.image(0, 20, 'emptyStatusBar').setOrigin(0, 0.5).setScale(0.8);
            const fullBar = this.add.image(0, 20, 'fullStatusBar').setOrigin(0, 0.5).setScale(0.8);
            const container = this.add.container(0, 0, [label, emptyBar, fullBar]);
            this.ui.statusBars[status.toLowerCase()] = { 
                label, 
                bar: fullBar, 
                container 
            };

            // --- TAMBAHAN: Simpan referensi ke container status bar terakhir ---
            if (index === statusKeys.length - 1) {
                this.ui.lastStatusBarContainer = container;
            }
        });

        // Icon Panel Kanan
        this.ui.iconPanel = {
            profile: this.add.image(0, 0, 'profileIcon').setInteractive({ cursor: 'pointer' }).setScale(0.5),
            bag: this.add.image(0, 0, 'bagIcon').setInteractive({ cursor: 'pointer' }).setScale(0.5),
            home: this.add.image(0, 0, 'homeIcon').setInteractive({ cursor: 'pointer' }).setScale(0.07)
        };
        
        // Tombol Aksi Utama
        this.ui.actionButtons = {
            feed: this.add.image(0, 0, 'feedButton').setScale(0.5).setInteractive({ cursor: 'pointer' }).on('pointerdown', () => this.playerPet.feed()),
            sleep: this.add.image(0, 0, 'sleepButton').setScale(0.5).setInteractive({ cursor: 'pointer' }).on('pointerdown', () => this.playerPet.isAsleep ? this.playerPet.wakeUp() : this.playerPet.sleep()),
            training: this.add.image(0, 0, 'trainingButton').setScale(0.5).setInteractive({ cursor: 'pointer' }).on('pointerdown', () => this.showSubMenu('train')),
            play: this.add.image(0, 0, 'playButton').setScale(0.5).setInteractive({ cursor: 'pointer' }).on('pointerdown', () => this.showSubMenu('play'))
        };

        // Level Text
        this.ui.levelText = this.add.text(0, 0, `level ${String(this.playerPet.stats.level).padStart(2, '0')}`, { 
            fontFamily: 'Pixelify Sans', 
            fontSize: '16px', 
            color: '#ffffff',
            backgroundColor: '#9F51FE',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Tambahkan border putih di sekitar teks level secara manual
        this.ui.levelBorder = this.add.graphics();
    }
    
    // --- Fungsi Update Tampilan ---
    updateUI(stats) {
        Object.keys(this.ui.statusBars).forEach(key => {
            const statName = key.charAt(0).toUpperCase() + key.slice(1);
            const { label, bar } = this.ui.statusBars[key];
            
            label.setText(`${statName.toUpperCase()}: ${stats[key]}`);
            
            const percentage = stats[key] / 100;
            bar.setCrop(0, 0, bar.texture.source[0].width * percentage, bar.height);
        });
    }
    
    // --- Fungsi Logika UI ---
    showSubMenu(type) {
        if (this.ui.subMenu) this.ui.subMenu.destroy();
        
        const options = type === 'play' 
            ? [{ text: 'Groom', action: 'groom' }, { text: 'Pet', action: 'pet' }, { text: 'Toys', action: 'toys' }]
            : [{ text: 'Battle', action: 'battle' }, { text: 'Strolling', action: 'strolling' }, { text: 'Hunting', action: 'hunting' }];

        // Dapatkan posisi dari container status bar terakhir
        const anchorX = this.ui.lastStatusBarContainer.x;
        const anchorY = this.ui.lastStatusBarContainer.y;

        // Buat container menu
        const menuContainer = this.add.container(0, 0); // Posisi awal di 0,0
        this.ui.subMenu = menuContainer;

        // Gambar background menu
        const bg = this.add.image(0, 0, 'popup-box').setScale(0.7).setOrigin(0, 0); // Origin di kiri atas
        menuContainer.add(bg);

        // Tambahkan opsi-opsi menu
        options.forEach((opt, index) => {
            // Posisikan teks di dalam background
            const yPos = 30 + (index * 35); // Sesuaikan padding dan jarak
            const xPos = bg.displayWidth / 2; // Tepat di tengah background
            
            const optText = this.add.text(xPos, yPos, opt.text, { 
                fontFamily: 'Pixelify Sans', 
                fontSize: '22px', 
                color: '#333' 
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            
            optText.on('pointerdown', () => {
                if (type === 'play') this.playerPet.play(opt.action);
                if (type === 'train') this.playerPet.train(opt.action);
                this.ui.subMenu.destroy();
                this.ui.subMenu = null;
            });
            menuContainer.add(optText);
        });

        menuContainer.setPosition(anchorX, anchorY + 60); 

        menuContainer.setAlpha(0);
        this.tweens.add({
            targets: menuContainer,
            alpha: 1,
            duration: 200,
            ease: 'Power1'
        });
    }

    showGameOverPopup(title, message) {
        // ... (logika untuk menampilkan popup game over) ...
    }
    showEvolutionPopup(data) {
        // ... (logika untuk menampilkan popup evolusi) ...
    }
    
    // --- Positioning ---
    repositionUI() {
        const { width, height } = this.scale;
        if (!this.playerPet) return;
        
        // 1. Posisikan Pet di tengah, sedikit ke bawah
        this.playerPet.setPosition(width / 2, height / 2 + 100);

        // 2. Posisikan Level Text di tengah atas
        this.ui.levelText.setPosition(width / 2, height * 0.15);
        
        // Gambar ulang border untuk level text
        const textBounds = this.ui.levelText.getBounds();
        this.ui.levelBorder.clear()
            .lineStyle(3, 0xFFFFFF, 1)
            .strokeRoundedRect(textBounds.x - 4, textBounds.y - 4, textBounds.width + 8, textBounds.height + 8, 10);
        
        // 3. Posisikan Status Bars di kiri atas
        const statusStartX = width * 0.08;
        const statusStartY = height * 0.15;
        Object.values(this.ui.statusBars).forEach((element, index) => {
            element.container.setPosition(statusStartX, statusStartY + index * 50);
        });

        // 4. Posisikan Icon Panel di kanan atas
        const iconStartX = width * 0.92;
        this.ui.iconPanel.profile.setPosition(iconStartX, statusStartY);
        this.ui.iconPanel.bag.setPosition(iconStartX, statusStartY + 60);
        this.ui.iconPanel.home.setPosition(iconStartX, statusStartY + 120);

        // 5. Posisikan Tombol Aksi di bawah
        const buttonY = height * 0.9;
        const buttonSpacing = width * 0.22;
        const buttonStartX = width / 2 - (buttonSpacing * 1.5);
        this.ui.actionButtons.feed.setPosition(buttonStartX, buttonY);
        this.ui.actionButtons.sleep.setPosition(buttonStartX + buttonSpacing, buttonY);
        this.ui.actionButtons.training.setPosition(buttonStartX + buttonSpacing * 2, buttonY);
        this.ui.actionButtons.play.setPosition(buttonStartX + buttonSpacing * 3, buttonY);
    }
}