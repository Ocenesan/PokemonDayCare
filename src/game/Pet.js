export default class Pet {
    /**
     * @param {Phaser.Scene} scene - Scene tempat pet ini akan ditampilkan.
     * @param {number} x - Posisi X di scene.
     * @param {number} y - Posisi Y di scene.
     * @param {object} pokemonRegistryData - Data yang disimpan di registry (data & sprites).
     */
    constructor(scene, x, y, pokemonRegistryData) {
        this.scene = scene;
        this.pokemonData = pokemonRegistryData.data;
        this.spriteUrls = pokemonRegistryData.sprites;
        this.name = this.pokemonData.name;

        // Properti status game
        this.hunger = 100;
        this.boredom = 100;
        this.level = 1;
        // ...status lainnya

        // --- INI BAGIAN PENTING UNTUK SPRITE ANIMASI ---
        
        // Buat DOM Element untuk menampilkan GIF
        // Kita menggunakan `div` dengan background-image agar lebih mudah dikontrol
        const petHtml = `<div id="pet-sprite" style="
            width: 96px; 
            height: 96px; 
            background-image: url(${this.spriteUrls.animated});
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            image-rendering: pixelated; 
            transform: scale(2.5); /* Perbesar ukuran sprite */
        "></div>`;

        // Tambahkan elemen HTML ini ke game menggunakan Phaser.add.dom
        this.gameObject = scene.add.dom(x, y).createFromHTML(petHtml);
    }

    // Fungsi untuk memperbarui status
    update(time, delta) {
        // Logika game, misalnya mengurangi hunger setiap detik
    }

    // Fungsi untuk mengubah tampilan (misal: saat tidur)
    sleep() {
        // Ganti URL sprite dengan versi statis saat tidur
        const petSpriteDiv = this.gameObject.node.querySelector('#pet-sprite');
        petSpriteDiv.style.backgroundImage = `url(${this.spriteUrls.default})`;
        petSpriteDiv.style.opacity = '0.7'; // Beri efek redup
    }

    wakeUp() {
        // Kembalikan ke sprite animasi
        const petSpriteDiv = this.gameObject.node.querySelector('#pet-sprite');
        petSpriteDiv.style.backgroundImage = `url(${this.spriteUrls.animated})`;
        petSpriteDiv.style.opacity = '1';
    }

    // Hancurkan objek saat tidak diperlukan lagi
    destroy() {
        this.gameObject.destroy();
    }
}