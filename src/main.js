import './style.css'

import Phaser from 'phaser';
import HomescreenScene from './scenes/HomescreenScene.js';
import ChoosePokemonScene from './scenes/ChoosePokemonScene.js';
import SearchPokemonScene from './scenes/SearchPokemonScene.js';
import MainGameScene from './scenes/MainGameScene.js';

const config = {
    type: Phaser.AUTO, // Otomatis pilih WebGL atau Canvas
    parent: 'game-container',
    // Gunakan Scale Manager untuk membuat game responsif
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        width: 800,  
        height: 600,
    },
    
    dom: {
        createContainer: true
    },

    scene: [
        // Daftarkan semua scene Anda di sini. Urutan pertama akan dijalankan lebih dulu.
        //HomescreenScene,
        ChoosePokemonScene,
        //SearchPokemonScene,
        MainGameScene,
    ]
};

const game = new Phaser.Game(config);