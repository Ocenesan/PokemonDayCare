import Pet from '../game/Pet.js';

export default class MainGameScene extends Phaser.Scene {
    constructor() {
        super('MainGameScene');
        this.playerPet = null; // Properti untuk menyimpan pet kita
    }

    preload() {
        this.load.image('game-background', 'assets/images/bgpokemon.png');
        // Aset lain untuk scene ini...
    }

    create() {
        this.add.image(400, 300, 'game-background');

        // Ambil data Pokémon yang dipilih dari registry
        const pokemonRegistryData = this.registry.get('playerPokemon');

        if (pokemonRegistryData) {
            // Buat instance dari Pet kita, yang akan otomatis menampilkan sprite animasinya
            this.playerPet = new Pet(this, 400, 350, pokemonRegistryData);

            // Tambahkan tombol untuk interaksi
            const sleepButton = this.add.text(50, 550, 'Sleep', { fontSize: '24px', backgroundColor: '#fff', color: '#000' })
                .setInteractive();
            
            const wakeButton = this.add.text(150, 550, 'Wake Up', { fontSize: '24px', backgroundColor: '#fff', color: '#000' })
                .setInteractive();
            
            sleepButton.on('pointerdown', () => {
                this.playerPet.sleep();
            });

            wakeButton.on('pointerdown', () => {
                this.playerPet.wakeUp();
            });

        } else {
            // Handle kasus jika tidak ada data (misalnya, debug langsung ke scene ini)
            this.add.text(400, 300, 'Tidak ada Pokémon dipilih!', { color: '#ff0000' }).setOrigin(0.5);
        }
    }

    update(time, delta) {
        if (this.playerPet) {
            // Jalankan update loop untuk pet kita
            this.playerPet.update(time, delta);
        }
    }
}