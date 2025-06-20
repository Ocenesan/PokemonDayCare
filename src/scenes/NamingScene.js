export default class NamingScene extends Phaser.Scene {
    constructor() {
        super('NamingScene');
        this.pokemonData = null;
        this.inputElement = null;
        this.confirmButton = null;
    }

    preload(){
        this.load.image('game-bg', 'assets/images/bgpokemon.png');
        this.load.image('input-bg', 'assets/images/icons/box-input.png');
        this.load.image('confirm-btn', 'assets/images/icons/confirm-hj.png');
        this.load.image('cancel-btn', 'assets/images/icons/cancel.png');
        this.load.image('title', 'assets/images/title.png');
        this.load.image('egg-sprite', 'assets/images/pokemon/egg.png');
    }

    create() {
        // Retrieve the chosen Pokémon data from the registry
        this.pokemonData = this.registry.get('playerPokemon');

        if (!this.pokemonData) {
            console.error("NamingScene: No Pokémon data found! Returning to home.");
            this.scene.start('Homescreen');
            return;
        }

        // --- Create UI Elements ---
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'game-bg');
        this.title = this.add.image(0, 0, 'title');
        this.egg = this.add.image(0, 0, 'egg-sprite').setScale(1.5);
        this.inputBg = this.add.image(0, 0, 'input-bg');

        // HTML input field for the name
        this.domInputElement = this.add.dom(0, 0).createFromHTML(
            `<input type="text" name="nameField" placeholder="Input Pokémon Name" maxlength="12" style="width: 280px; height: 40px; border: none; background: transparent; font-size: 18px; color: #333; text-align: center; outline: none; font-family: 'Pixelify Sans', sans-serif;">`
        );
        this.inputElement = this.domInputElement.getChildByName('nameField');

        this.caption = this.add.text(0, 0, 'Are you sure you want to name it that?', {
            fontFamily: 'Pixelify Sans', fontSize: '20px', color: '#000'
        }).setOrigin(0.5);

        this.confirmButton = this.add.image(0, 0, 'confirm-btn');
        this.cancelButton = this.add.image(0, 0, 'cancel-btn');

        // --- Set up Event Listeners ---
        this.cancelButton.on('pointerdown', () => this.scene.start('Homescreen'));
        this.cancelButton.setInteractive({ useHandCursor: true });

        this.confirmButton.on('pointerdown', () => {
            if (this.confirmButton.alpha < 1) return; 
            
            const nickname = this.inputElement.value.trim();
            if (nickname) {
                this.pokemonData.nickname = nickname;
                this.registry.set('playerPokemon', this.pokemonData);
                this.scene.start('MainGameScene');
            }
        });

        // Add listener to enable/disable confirm button
        this.inputElement.addEventListener('keyup', this.validateInput.bind(this));

        [this.confirmButton, this.cancelButton].forEach(button => {
            button.on('pointerover', () => button.setScale(0.8));
            button.on('pointerout', () => button.setScale(0.5));
        });

        // Initial setup
        this.repositionElements();
        this.validateInput(); // Run once to set initial state of confirm button
        this.scale.on('resize', this.repositionElements, this);
    }

    validateInput() {
        const name = this.inputElement.value.trim();
        if (name.length > 0) {
            this.confirmButton.setAlpha(1).setInteractive({ useHandCursor: true });
        } else {
            this.confirmButton.setAlpha(0.5).disableInteractive();
        }
    }

    repositionElements() {
        const { width, height } = this.scale;

        this.title.setPosition(width / 2, height * 0.20).setScale(width / 1400);
        this.inputBg.setPosition(width / 2, height * 0.4).setScale(0.8);
        this.domInputElement.setPosition(width / 2, height * 0.4);
        this.egg.setPosition(width / 2, height / 2 + 100).setScale(0.7);
        this.caption.setPosition(width / 2, height * 0.78);
        const buttonY = height * 0.9;
        this.confirmButton.setPosition(width / 2 - 80, buttonY).setScale(0.5);
        this.cancelButton.setPosition(width / 2 + 80, buttonY).setScale(0.5);
    }
}