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
        this.load.image('statusBar', 'assets/images/icons/status.png');
        this.load.image('profileIcon', 'assets/images/icons/profile.png');
        this.load.image('bagIcon', 'assets/images/icons/bag.png');
        this.load.image('homeButton', 'assets/images/icons/home.png');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'game-bg');
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
        ['Hunger', 'Boredom', 'Tiredness'].forEach(status => {
            const label = this.add.text(0, 0, status.toUpperCase() + ':', { fontSize: '18px', fontFamily: 'Aldrich' });
            const bar = this.add.image(0, 25, 'statusBar').setOrigin(0, 0.5).setScale(1.2, 1);
            this.ui.statusBars[status.toLowerCase()] = { label, bar, container: this.add.container(0,0,[label, bar]) };
        });

        // Tombol Aksi Utama
        this.ui.feedButton = this.add.image(0, 0, 'feedButton').setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.playerPet.feed());
        this.ui.sleepButton = this.add.image(0, 0, 'sleepButton').setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.playerPet.isAsleep ? this.playerPet.wakeUp() : this.playerPet.sleep());
        this.ui.playButton = this.add.image(0, 0, 'playButton').setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.showSubMenu('play'));
        this.ui.trainingButton = this.add.image(0, 0, 'trainingButton').setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.showSubMenu('train'));

        // Elemen Lain
        this.ui.levelText = this.add.text(0, 0, `Level ${this.playerPet.stats.level}`, { fontFamily: 'Pixelify Sans', fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.ui.berryText = this.add.text(0, 0, `Berries: ${this.playerPet.stats.berries}`, { fontSize: '16px' }).setOrigin(1, 0);
    }
    
    // --- Fungsi Update Tampilan ---
    updateUI(stats) {
        Object.keys(this.ui.statusBars).forEach(key => {
            const barImage = this.ui.statusBars[key].bar;
            const percentage = stats[key] / 100;
            // Gunakan setCrop untuk mengubah lebar bar secara visual
            barImage.setCrop(0, 0, barImage.width * percentage, barImage.height);
        });
        this.ui.berryText.setText(`Berries: ${stats.berries}`);
    }
    
    // --- Fungsi Logika UI ---
    showSubMenu(type) {
        if (this.ui.subMenu) this.ui.subMenu.destroy();
        
        const options = type === 'play' 
            ? [{ text: 'Groom', action: 'groom' }, { text: 'Pet', action: 'pet' }, { text: 'Toys', action: 'toys' }]
            : [{ text: 'Battle', action: 'battle' }, { text: 'Strolling', action: 'strolling' }, { text: 'Hunting', action: 'hunting' }];

        const { width, height } = this.scale;
        const menuContainer = this.add.container(width/2, height*0.5);
        this.ui.subMenu = menuContainer;

        const bg = this.add.image(0, 0, 'popup-box').setScale(0.8);
        menuContainer.add(bg);

        options.forEach((opt, index) => {
            const yPos = -50 + index * 50;
            const optText = this.add.text(0, yPos, opt.text, { fontSize: '24px', color: '#333' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            optText.on('pointerdown', () => {
                if (type === 'play') this.playerPet.play(opt.action);
                if (type === 'train') this.playerPet.train(opt.action);
                this.ui.subMenu.destroy();
                this.ui.subMenu = null;
            });
            menuContainer.add(optText);
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
        
        this.playerPet.setPosition(width / 2, height / 2 + 50);
        this.ui.levelText.setPosition(width / 2, height * 0.1);

        // Status bars
        const statusStartX = width * 0.05;
        const statusStartY = height * 0.1;
        Object.values(this.ui.statusBars).forEach((element, index) => {
            element.container.setPosition(statusStartX, statusStartY + index * 60);
        });
        
        // Berry text
        this.ui.berryText.setPosition(width * 0.95, statusStartY);

        // Tombol Aksi
        const buttonY = height * 0.9;
        const buttonSpacing = width * 0.22;
        const buttonStartX = width / 2 - (buttonSpacing * 1.5);
        this.ui.feedButton.setPosition(buttonStartX, buttonY);
        this.ui.sleepButton.setPosition(buttonStartX + buttonSpacing, buttonY);
        this.ui.trainingButton.setPosition(buttonStartX + buttonSpacing * 2, buttonY);
        this.ui.playButton.setPosition(buttonStartX + buttonSpacing * 3, buttonY);
    }
}