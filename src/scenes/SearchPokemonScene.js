import * as PokeAPI from '../game/PokeAPIService.js';

export default class SearchPokemonScene extends Phaser.Scene {
    constructor() {
        super('SearchPokemonScene');

        // Properti untuk menyimpan elemen-elemen UI
        this.background = null;
        this.title = null;
        this.inputFieldContainer = null; // Gambar 'box-input.png'
        this.confirmButton = null;
        this.domInputElement = null;     // Elemen HTML untuk input
        this.inputField = null;          // Referensi ke <input>
        this.feedbackText = null;
    }

    preload() {
        // Aset yang sudah Anda definisikan
        this.load.image('choose-bg', 'assets/images/background.jpg');
        this.load.image('title', 'assets/images/title.png');
        this.load.image('confirmButton', 'assets/images/icons/confirm.png');
        this.load.image('inputField', 'assets/images/icons/box-input.png');
    }

    create() {
        // --- 1. Buat Semua Elemen Game ---
        this.background = this.add.image(0, 0, 'choose-bg');
        this.title = this.add.image(0, 0, 'title');
        this.inputFieldContainer = this.add.image(0, 0, 'inputField');
        this.confirmButton = this.add.image(0, 0, 'confirmButton').setInteractive({ cursor: 'pointer' });

        // --- 2. Buat Elemen Input HTML ---
        // Elemen HTML ini akan kita buat transparan dan letakkan di atas 'inputFieldContainer'
        const htmlForm = `
            <input type="text" name="searchInput" placeholder="Input pokemon index or name"
                   style="width: 300px; height: 40px; background: transparent; border: none; font-size: 18px; color: #333; text-align: center; outline: none; font-family: 'Pixelify Sans', sans-serif;">
        `;
        
        this.domInputElement = this.add.dom(0, 0).createFromHTML(htmlForm);
        this.inputField = this.domInputElement.getChildByName('searchInput');

        // --- 3. Atur Event Handling ---
        this.confirmButton.on('pointerdown', this.handleConfirm, this);
        this.input.keyboard.on('keydown-ENTER', this.handleConfirm, this);

        // Tambahkan event untuk kembali ke scene pilih pokemon (misalnya, dengan tombol ESC)
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('ChoosePokemonScene');
        });

        // --- 4. Atur Posisi & Event Resize ---
        this.repositionElements();
        this.scale.on('resize', this.repositionElements, this);
    }

    handleConfirm() {
        const pokemonName = this.inputField.value.trim().toLowerCase();

        if (!pokemonName) {
            this.showFeedbackMessage('Harap masukkan nama atau ID Pokémon!', 'red');
            return;
        }

        this.confirmButton.disableInteractive().setTint(0x888888);
        this.inputField.disabled = true;
        this.showFeedbackMessage(`Mencari ${pokemonName}...`, 'white');

        this.findPokemon(pokemonName);
    }

    async findPokemon(pokemonName) {
        const pokemonData = await PokeAPI.getPokemonData(pokemonName);

        if (pokemonData) {
            const sprites = PokeAPI.extractPokemonSprites(pokemonData);
            
            this.registry.set('playerPokemon', {
                data: pokemonData,
                sprites: sprites
            });

            this.showFeedbackMessage(`${pokemonData.name.toUpperCase()} ditemukan!`, '#32CD32'); // Hijau limau

            this.time.delayedCall(1500, () => {
                this.scene.start('MainGameScene');
            });
        } else {
            this.showFeedbackMessage(`Pokémon "${pokemonName}" tidak ditemukan!`, 'red');
            
            this.confirmButton.setInteractive().clearTint();
            this.inputField.disabled = false;
        }
    }

    showFeedbackMessage(message, color) {
        if (this.feedbackText) {
            this.feedbackText.destroy();
        }

        const { width } = this.scale;
        this.feedbackText = this.add.text(this.confirmButton.x, this.confirmButton.y + 70, message, {
            fontFamily: 'Pixelify Sans', fontSize: '20px', color: color,
            stroke: '#000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Hanya hapus pesan error atau sukses secara otomatis
        if (color !== 'white') {
            this.time.delayedCall(3000, () => {
                if (this.feedbackText) {
                    this.feedbackText.destroy();
                    this.feedbackText = null;
                }
            });
        }
    }

    repositionElements() {
        const { width, height } = this.scale;

        // Latar Belakang & Judul
        this.background.setPosition(width / 2, height / 2).setScale(Math.max(width / this.background.width, height / this.background.height));
        this.title.setPosition(width / 2, height * 0.20).setScale(width / 1400);

        // --- Posisikan Elemen Input Sesuai Gambar ---
        // Container/background untuk input field
        this.inputFieldContainer.setPosition(width / 2, height * 0.5);
        this.inputFieldContainer.setScale(1); // Sedikit diperbesar

        // Elemen DOM (input teks) diposisikan persis di atas containernya
        this.domInputElement.setPosition(this.inputFieldContainer.x, this.inputFieldContainer.y);

        // Tombol Confirm diposisikan di bawah input field
        this.confirmButton.setPosition(width / 2, this.inputFieldContainer.y + 150);

        // Posisikan ulang feedback text jika ada
        if (this.feedbackText) {
            this.feedbackText.setPosition(this.confirmButton.x, this.confirmButton.y + 70);
        }
    }
}