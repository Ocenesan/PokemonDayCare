import * as PokeAPI from '../game/PokeAPIService.js';

export default class ChoosePokemonScene extends Phaser.Scene {
    constructor() {
        super('ChoosePokemonScene');

        // Daftar Pokémon yang akan ditampilkan di carousel
        this.starterPokemonNames = ['pikachu', 'squirtle', 'bulbasaur', 'charmander', 'eevee', 'jigglypuff'];
        
        // Properti untuk mengelola state carousel
        this.carouselContainer = null;
        this.carouselBox = null;
        this.currentIndex = 0;
        this.spacing = 180; // Jarak antar pokemon, kita akan sesuaikan
    }

    preload() {
        // Path 'assets/...' karena kita menaruhnya di folder public
        this.load.image('choose-bg', 'assets/images/background.jpg'); 
        this.load.image('arrow-left', 'assets/images/icons/nav-left.png');
        this.load.image('arrow-right', 'assets/images/icons/nav-right.png');
        this.load.image('searchButton', 'assets/images/icons/search.png');
        this.load.image('title', 'assets/images/title.png');
    }

    create() {
        // --- 1. Setup UI Dasar dan Latar Belakang ---
        this.background = this.add.image(0, 0, 'choose-bg').setOrigin(0.5, 0.5);
        this.title = this.add.image(0, 0, 'title').setOrigin(0.5, 0.5);
        this.carouselBox = this.add.graphics();
        
        // --- 4. Container untuk Pokémon ---
        this.carouselContainer = this.add.container(0, 0);

        // --- 2. Tombol Navigasi Carousel ---
        this.arrowLeft = this.add.image(0, 0, 'arrow-left').setInteractive({ cursor: 'pointer' });
        this.arrowRight = this.add.image(0, 0, 'arrow-right').setInteractive({ cursor: 'pointer' });
        this.searchButton = this.add.image(0, 0, 'searchButton').setInteractive({ cursor: 'pointer' });

        this.arrowLeft.on('pointerdown', () => this.scrollCarousel(-1));
        this.arrowRight.on('pointerdown', () => this.scrollCarousel(1));

        // --- 3. Tombol Search ---
        this.searchButton.on('pointerdown', () => {
             // Ganti dengan scene pencarian Anda nanti, misal: 'SearchScene'
            console.log("Navigasi ke Scene Pencarian...");
            this.scene.start('SearchPokemonScene'); 
        });

        // Atur posisi semua elemen UI
        this.repositionElements();
        this.scale.on('resize', this.repositionElements, this);

        // --- 5. Memuat data dan sprite Pokémon ---
        this.loadStarterPokemon();
    }

    async loadStarterPokemon() {
        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading Pokémon...', {
            fontFamily: 'Pixelify Sans', fontSize: '32px', color: '#FFF'
        }).setOrigin(0.5);

        // Muat semua sprite Pokémon secara dinamis
        for (const name of this.starterPokemonNames) {
            const pokemonData = await PokeAPI.getPokemonData(name);
            if (pokemonData) {
                const sprites = PokeAPI.extractPokemonSprites(pokemonData);
                // Kita gunakan sprite 'official' untuk tampilan yang lebih modern
                this.load.image(`pokemon_${name}`, sprites.official);
            }
        }
        
        // Jalankan loader dan tunggu selesai
        this.load.start();
        this.load.once('complete', () => {
            loadingText.destroy();
            this.createPokemonInCarousel();
        });
    }

    createPokemonInCarousel() {
        // Ambil lebar box yang sudah digambar untuk referensi
        const boxWidth = this.scale.width * 0.7;
        
        // Tentukan jarak antar pokemon agar pas di dalam box
        // Kita tampilkan 3 pokemon, jadi ada 4 'slot' (kiri, tengah1, tengah2, kanan)
        this.spacing = boxWidth / 3; 

        // Bersihkan container jika ada item lama (untuk jaga-jaga)
        this.carouselContainer.removeAll(true);
        
        this.starterPokemonNames.forEach((name, index) => {
            // Posisikan setiap item bersebelahan dalam satu baris panjang
            const xPos = index * this.spacing;
            const itemContainer = this.add.container(xPos, 0);

            const pokemonImage = this.add.image(0, -20, `pokemon_${name}`).setScale(0.35);

            const pokemonText = this.add.text(0, 60, name.charAt(0).toUpperCase() + name.slice(1), {
                fontFamily: 'Pixelify Sans', fontSize: '20px', color: '#000000'
            }).setOrigin(0.5);

            itemContainer.add([pokemonImage, pokemonText]);
            itemContainer.setSize(pokemonImage.width * 0.6, 150).setInteractive({ cursor: 'pointer' });

            itemContainer.on('pointerdown', () => this.onPokemonConfirm(name));
            itemContainer.on('pointerover', () => itemContainer.setScale(1.1));
            itemContainer.on('pointerout', () => itemContainer.setScale(1.0));

            this.carouselContainer.add(itemContainer);
        });

        this.updateCarouselVisibility();
    }
    
    scrollCarousel(direction) {
        this.currentIndex += direction;
        this.updateCarouselVisibility();
    }

    updateCarouselVisibility() {
        const itemsVisible = 3; // Berapa pokemon yang ingin ditampilkan sekaligus

        // Batasi pergerakan agar tidak keluar dari daftar
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        } else if (this.currentIndex > this.starterPokemonNames.length - itemsVisible) {
            this.currentIndex = this.starterPokemonNames.length - itemsVisible;
        }

        // Hitung offset X berdasarkan pokemon yang sedang aktif
        const targetOffset = this.currentIndex * this.spacing;

        // Posisi X awal dari seluruh barisan pokemon agar terpusat
        const startX = this.scale.width / 2 - this.spacing;

        // Posisi akhir container adalah posisi awal dikurangi offset scroll
        const finalX = startX - targetOffset;

        // Animasikan pergerakan container. 
        // Logikanya: (posisi tengah container) + (posisi awal barisan pokemon) - (offset scroll)
        // Karena posisi awal (startX) sudah dihitung, kita hanya perlu menggeser berdasarkan offset
        this.tweens.add({
            targets: this.carouselContainer,
            x: finalX,
            duration: 300,
            ease: 'Power2'
        });

        // Tampilkan/sembunyikan tombol panah
        this.arrowLeft.setVisible(this.currentIndex > 0);
        this.arrowRight.setVisible(this.currentIndex < this.starterPokemonNames.length - itemsVisible);
    }
    
    async onPokemonConfirm(pokemonName) {
        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, `Memilih ${pokemonName}...`, { 
            fontFamily: 'Pixelify Sans', fontSize: '32px', color: '#FFF' 
        }).setOrigin(0.5);

        const pokemonData = await PokeAPI.getPokemonData(pokemonName);

        if (pokemonData) {
            const sprites = PokeAPI.extractPokemonSprites(pokemonData);
            
            this.registry.set('playerPokemon', { data: pokemonData, sprites: sprites });
            
            this.time.delayedCall(500, () => { this.scene.start('NamingScene'); });

        } else {
            loadingText.setText(`Gagal memuat data ${pokemonName}!`);
            this.time.delayedCall(2000, () => loadingText.destroy());
        }
    }

    repositionElements() {
        const { width, height } = this.scale;

        // Latar Belakang
        this.background.setPosition(width / 2, height / 2);
        const scaleBg = Math.max(width / this.background.width, height / this.background.height);
        this.background.setScale(scaleBg);

        // Judul
        this.title.setPosition(width / 2, height * 0.15);
        this.title.setScale(width / 1400);

        // Tentukan dimensi dan properti carousel box
        const boxWidth = width * 0.7;  // Lebar 70% dari layar
        const boxHeight = height * 0.35; // Tinggi 35% dari layar
        const boxX = (width - boxWidth) / 2; // Posisi X agar di tengah
        const boxY = (height - boxHeight) / 2; // Posisi Y agar di tengah
        const cornerRadius = 40; // Radius sudut melengkung

        // Bersihkan gambar sebelumnya sebelum menggambar ulang
        this.carouselBox.clear();
        
        // Atur warna dan gaya
        this.carouselBox.fillStyle(0xFFFDE0, 0.9); // Warna kuning pucat, opacity 90%
        this.carouselBox.lineStyle(5, 0xE0CBA8, 1); // Border/stroke

        // Gambar kotak persegi panjang dengan sudut melengkung
        this.carouselBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
        this.carouselBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);

        // Posisikan Carousel Container di tengah box yang baru digambar
        if (this.carouselContainer) {
            this.carouselContainer.setPosition(width / 2, height / 2);

            // Buat 'mask' agar Pokémon hanya terlihat di dalam box
            // Masker juga harus dibuat ulang karena ukuran box bisa berubah
            const maskShape = this.make.graphics();
            maskShape.fillStyle(0xffffff);
            // Gunakan dimensi yang sama dengan box yang kita gambar
            maskShape.fillRect(boxX, boxY, boxWidth, boxHeight);
            this.carouselContainer.mask = new Phaser.Display.Masks.GeometryMask(this, maskShape);
        }

        // Posisikan Tombol Panah relatif terhadap box yang baru digambar
        this.arrowLeft.setPosition(boxX - 40, height / 2);
        this.arrowRight.setPosition(boxX + boxWidth + 40, height / 2);
        
        // Tombol Search
        this.searchButton.setPosition(width / 2, height * 0.85);
    }
}