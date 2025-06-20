import * as PokeAPI from './PokeAPIService.js';

// Gunakan EventEmitter bawaan Phaser untuk komunikasi antar kelas
export default class Pet extends Phaser.Events.EventEmitter {
    constructor(scene, x, y, pokemonRegistryData) {
        super(); // Penting untuk mengaktifkan EventEmitter

        this.scene = scene;
        this.pokemonData = pokemonRegistryData.data;
        this.spriteUrls = pokemonRegistryData.sprites;
        this.name = this.pokemonData.name;
        this.isAsleep = false;
        
        // --- Properti Status Game ---
        this.stats = {
            hunger: 100,      // Kenyang
            boredom: 100,     // Senang
            tired: 100,   // Segar
            exp: 0,
            maxExp: 50,
            level: 1,
            inventory: {
                'Berries': { // Pastikan 'B'-nya besar
                    'cheri': 3,
                    'pecha': 2,
                    'oran': 5
                },
                'General': { 
                    'poke-ball': 10,
                    'potion': 5
                }
            }
        };

        // Buat DOM Element untuk menampilkan GIF
        const petHtml = `<div id="pet-sprite" style="
            width:96px;
            height:96px;
            background-image:url(${this.spriteUrls.animated});
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            image-rendering: pixelated;
            transform:scale(2);
        "></div>`;
        this.gameObject = scene.add.dom(x, y).createFromHTML(petHtml);

        // Timer untuk mengurangi status secara berkala
        this.decayTimer = scene.time.addEvent({
            delay: 8000, // Status berkurang setiap 8 detik
            callback: this.decreaseStats,
            callbackScope: this,
            loop: true
        });
    }

    feed(berryName) {
        if (this.isAsleep || !this.stats.inventory.Berries || !this.stats.inventory.Berries[berryName] || this.stats.inventory.Berries[berryName] <= 0) {
            console.warn(`Mencoba memberi makan dengan ${berryName}, tetapi tidak ada di inventaris atau pet sedang tidur.`);
            return;
        }
        console.log(`Feeding with ${berryName}. Current count: ${this.stats.inventory.Berries[berryName]}`);

        this.stats.inventory.Berries[berryName]--;

        let hungerGain = 20; 
        if (berryName === 'oran') hungerGain = 30;
        if (berryName === 'pecha') this.stats.boredom = Math.min(100, this.stats.boredom + 10);
        this.stats.hunger = Math.min(100, this.stats.hunger + hungerGain);
        
        this.emit('onStatChange', this.stats);

        if (this.stats.inventory.Berries[berryName] <= 0) {
            delete this.stats.inventory.Berries[berryName];
        }

        this.emit('onInventoryChange', this.stats.inventory); 
    }

    play(type) {
        if (this.isAsleep) return;
        switch (type) {
            case 'groom':
                this.stats.boredom = Math.min(100, this.stats.boredom + 10);
                break;
            case 'pet':
                this.stats.boredom = Math.min(100, this.stats.boredom + 5);
                break;
            case 'toys':
                this.stats.boredom = Math.min(100, this.stats.boredom + 15);
                this.stats.hunger = Math.max(0, this.stats.hunger - 5);
                break;
        }
        this.emit('onStatChange', this.stats);
    }

    async train(type) {
        if (this.isAsleep) return;
        switch (type) {
            case 'battle':
                this.stats.hunger -= 8; this.stats.boredom -= 4; this.stats.tired -= 5;
                this.addExp(50);
                break;
            case 'hunting':
                this.stats.hunger -= 10; this.stats.boredom -= 5; this.stats.tired -= 10;
                this.addExp(25);
                break;
            case 'strolling':
                this.stats.hunger -= 4; this.stats.boredom += 8; this.stats.tired -= 5;
                
                // Ambil 3 berry acak
                console.log("Strolling for berries...");
                if (!this.stats.inventory.Berries) {
                    this.stats.inventory.Berries = {};
                }

                for (let i = 0; i < 3; i++) {
                    const randomBerryId = Phaser.Math.Between(1, 64);
                    const berryData = await PokeAPI.getBerry(randomBerryId);
                    if (berryData) {
                        const berryName = berryData.name;
                        this.stats.inventory.Berries[berryName] = (this.stats.inventory.Berries[berryName] || 0) + 1;
                        console.log(`Found a ${berryName} berry!`);
                    }
                }
                this.emit('onInventoryChange', this.stats.inventory);
                this.addExp(15);
                break;
        }
        this.stats.hunger = Math.max(0, this.stats.hunger);
        this.stats.boredom = Math.max(0, this.stats.boredom);
        this.stats.tired = Math.max(0, this.stats.tired);
        this.emit('onStatChange', this.stats);
    }

    sleep() {
        if (this.isAsleep) return;
        this.isAsleep = true;
        const petSpriteDiv = this.gameObject.node.querySelector('#pet-sprite');
        petSpriteDiv.style.backgroundImage = `url(${this.spriteUrls.default})`;
        petSpriteDiv.style.opacity = '0.7';
        this.emit('onStateChange', { asleep: true });
    }

    wakeUp() {
        if (!this.isAsleep) return;
        this.isAsleep = false;
        this.stats.tired = Math.min(100, this.stats.tired + 60); // Pulih banyak saat bangun
        const petSpriteDiv = this.gameObject.node.querySelector('#pet-sprite');
        petSpriteDiv.style.backgroundImage = `url(${this.spriteUrls.animated})`;
        petSpriteDiv.style.opacity = '1';
        this.emit('onStatChange', this.stats);
        this.emit('onStateChange', { asleep: false });
    }

    updateSprite() {
        if (this.gameObject && this.gameObject.node) {
            const petSpriteDiv = this.gameObject.node.querySelector('#pet-sprite');
            // Update the background image to the new animated sprite
            petSpriteDiv.style.backgroundImage = `url(${this.spriteUrls.animated})`;
        }
    }

    // --- Logika Internal Pet ---
    decreaseStats() {
        if (this.isAsleep) {
            this.stats.tired = Math.min(100, this.stats.tired + 10);
        } else {
            this.stats.hunger = Math.max(0, this.stats.hunger - 4);
            this.stats.boredom = Math.max(0, this.stats.boredom - 3);
            this.stats.tired = Math.max(0, this.stats.tired - 2);
        }
        this.emit('onStatChange', this.stats);
        this.checkFailureConditions();
    }

    addExp(amount) {
        this.stats.exp += amount;
        if (this.stats.exp >= this.stats.maxExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        this.stats.exp -= this.stats.maxExp;
        //this.stats.maxExp += 25; // Butuh lebih banyak exp untuk level selanjutnya
        this.emit('onLevelUp', this.stats.level);

        // Cek evolusi (contoh: evolusi di level 15 & 30)
        if (this.stats.level === 15 || this.stats.level === 30) {
            this.evolve();
        }
    }

    async evolve() {
        const evolutionChain = await PokeAPI.getEvolutionChain(this.pokemonData);
        if (!evolutionChain) return;

        let currentStage = evolutionChain.chain;
        let nextEvolutionName = null;

        // Cari tahap evolusi berikutnya
        while (currentStage && currentStage.species.name === this.name) {
            if (currentStage.evolves_to.length > 0) {
                nextEvolutionName = currentStage.evolves_to[0].species.name;
                break;
            }
            currentStage = currentStage.evolves_to[0];
        }

        if (nextEvolutionName) {
            const newPokemonData = await PokeAPI.getPokemonData(nextEvolutionName);
            if (newPokemonData) {
                // Perbarui data internal pet
                this.pokemonData = newPokemonData;
                this.spriteUrls = PokeAPI.extractPokemonSprites(newPokemonData);
                this.name = newPokemonData.name;
                this.updateSprite(); 

                // Pancarkan event evolusi
                this.emit('onEvolve', { 
                    newName: this.name, 
                    popupSpriteUrl: this.spriteUrls.default 
                });
            }
        }
    }

    checkFailureConditions() {
        if (this.stats.hunger < 20) {
            this.emit('onFaint', 'Your Pokémon fainted from hunger!');
            this.decayTimer.destroy();
        } else if (this.stats.boredom < 20) {
            this.emit('onRunAway', 'Your Pokémon ran away from boredom!');
            this.decayTimer.destroy();
        } else if (this.stats.tired < 25) {
            this.emit('onFaint', 'Your Pokémon fainted from exhaustion!');
            this.decayTimer.destroy();
        }
    }
    
    setPosition(x, y) {
        this.gameObject.setPosition(x, y);
    }
    
    show() {
        if (this.gameObject) {
            this.gameObject.setVisible(true);
        }
    }

    hide() {
        if (this.gameObject) {
            this.gameObject.setVisible(false);
        }
    }

    destroy() {
        if (this.decayTimer) this.decayTimer.destroy();
        if (this.gameObject) this.gameObject.destroy();
        this.removeAllListeners();
    }
}