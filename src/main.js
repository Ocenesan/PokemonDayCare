import './style.css'

import Phaser from 'phaser';
import HomescreenScene from './scenes/HomescreenScene.js';
// Impor scene lain di sini nanti
import ChoosePokemonScene from './scenes/ChoosePokemonScene.js';
//import SearchPokemonScene from './scenes/SearchPokemonScene.js';
//import MainGameScene from './scenes/MainGameScene.js';

const config = {
    type: Phaser.AUTO, // Otomatis pilih WebGL atau Canvas
    parent: 'game-container',
    // Gunakan Scale Manager untuk membuat game responsif
    scale: {
        mode: Phaser.Scale.FIT, // Cocokkan dengan ukuran layar, pertahankan rasio aspek
        autoCenter: Phaser.Scale.CENTER_BOTH, // Pusatkan kanvas secara horizontal dan vertikal
        width: 800,  // Ini adalah resolusi LOGIS game Anda
        height: 600, // Semua penempatan aset akan didasarkan pada ukuran ini
    },
    
    scene: [
        // Daftarkan semua scene Anda di sini. Urutan pertama akan dijalankan lebih dulu.
        //HomescreenScene,
        ChoosePokemonScene,
        //SearchPokemonScene,
        // MainGameScene,
    ]
};

// Buat game baru dengan konfigurasi di atas
const game = new Phaser.Game(config);