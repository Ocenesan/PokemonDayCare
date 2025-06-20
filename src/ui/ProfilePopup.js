// src/ui/ProfilePopup.js
import * as PokeAPI from '../game/PokeAPIService.js';

// Helper object for styling weakness types
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

export default class ProfilePopup {
    constructor(scene, petInstance, onCloseCallback) {
        this.scene = scene;
        this.petInstance = petInstance;
        this.pokemonData = petInstance.pokemonData;
        this.spriteData = petInstance.spriteUrls;
        this.onClose = onCloseCallback;
        this.domElement = null;

        // Start the process of creating the popup
        this.createPopup();
    }

    async createPopup() {
        // Create a loading placeholder
        const loadingText = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, 'Loading Profile...', {
            fontSize: '32px', fontFamily: 'Pixelify Sans', color: '#ffffff', backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(201);

        try {
            // --- Fetch all necessary data in parallel for speed ---
            const [speciesData, evolutionData, weaknesses] = await Promise.all([
                this.fetchData(this.pokemonData.species.url),
                this.fetchEvolutionChainData(this.pokemonData.species.url),
                this.fetchWeaknesses(this.pokemonData.types),
            ]);

            // --- Build the HTML with all the fetched data ---
            const popupHTML = this.buildHTML(speciesData, evolutionData, weaknesses);
            this.domElement = this.scene.add.dom(this.scene.scale.width / 2, this.scene.scale.height / 2).createFromHTML(popupHTML);
            this.domElement.setDepth(200);

            // Add event listeners for the buttons inside the HTML
            this.addEventListeners();

        } catch (error) {
            console.error("Failed to create profile popup:", error);
            // Optionally show an error message to the user
        } finally {
            // Remove the loading text once done
            loadingText.destroy();
        }
    }

    // --- Data Fetching Methods ---

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return response.json();
    }

    async fetchEvolutionChainData(speciesUrl) {
        const speciesData = await this.fetchData(speciesUrl);
        const evolutionChainData = await this.fetchData(speciesData.evolution_chain.url);

        const chain = [];
        let currentStage = evolutionChainData.chain;

        do {
            const stageSpecies = await this.fetchData(currentStage.species.url);
            const stagePokemon = await PokeAPI.getPokemonData(stageSpecies.name);
            chain.push({
                name: stageSpecies.name,
                sprite: stagePokemon.sprites.front_default,
            });
            currentStage = currentStage.evolves_to[0];
        } while (currentStage);

        return chain;
    }

    async fetchWeaknesses(types) {
        const weaknessSet = new Set();
        const typePromises = types.map(typeInfo => this.fetchData(typeInfo.type.url));
        const typeDetails = await Promise.all(typePromises);

        typeDetails.forEach(typeData => {
            typeData.damage_relations.double_damage_from.forEach(weakness => {
                weaknessSet.add(weakness.name);
            });
        });

        return Array.from(weaknessSet);
    }

    // --- HTML Building Method ---

    buildHTML(species, evolutionChain, weaknesses) {
        // Helper function to find English flavor text
        const getFlavorText = () => {
            const englishEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
            return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : 'No story available.';
        };

        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        const weaknessButtons = weaknesses.map(name =>
            `<button style="background-color:${typeColors[name] || '#777'}; color:white; border:none; padding: 8px 16px; border-radius: 15px; font-weight: bold; cursor: pointer;">
                ${capitalize(name)}
            </button>`
        ).join('');

        const evolutionSprites = evolutionChain.map(stage =>
            `<div style="text-align: center;">
                <div style="background-color: #FEEEEE; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; border: 2px solid #FDC0C0;">
                    <img src="${stage.sprite}" style="width: 60px; height: 60px;">
                </div>
                <p style="font-size: 14px; margin-top: 5px;">${capitalize(stage.name)}</p>
            </div>`
        ).join('<div style="align-self: center; width: 30px; border-top: 2px solid #FDC0C0; margin: 0 10px;"></div>');
        
        const abilities = this.pokemonData.abilities.map(a => capitalize(a.ability.name)).join(', ');
        
        return `
        <div id="profile-popup" style="
            width: 800px; 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            display: grid; 
            grid-template-columns: 320px 1fr; 
            padding: 25px; 
            gap: 20px;
            font-family: Pixelify Sans;
            position: relative;
        ">
            <!-- Close Button -->
            <div id="profile-close-btn" style="position:absolute; top: 15px; right: 15px; width: 40px; height: 40px; background: #E74C3C; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; font-weight: bold;">✕</div>

            <!-- Left Column -->
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 100%; padding: 10px; background: #E8A95E; color: white; border-radius: 20px; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
                    ${capitalize(this.pokemonData.name)}
                </div>
                <img id="profile-sprite" src="${this.spriteData.default}" style="width: 200px; height: 200px; image-rendering: pixelated; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-around; align-items: center; width: 100%;">
                    ${evolutionSprites}
                </div>
            </div>

            <!-- Right Column -->
            <div>
                <h3 style="margin-top:0;">Weaknesses</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">${weaknessButtons}</div>
                
                <h3>Story</h3>
                <p style="margin-bottom: 15px;">${getFlavorText()}</p>
                
                <h3>Version</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button id="normal-btn" class="version-btn active" style="border: 2px solid #EF8E18; background: #EF8E18; color: white; padding: 8px 20px; border-radius: 15px; font-weight: bold; cursor: pointer;">Normal</button>
                    <button id="shiny-btn" class="version-btn" style="border: 2px solid #ddd; background: white; color: #333; padding: 8px 20px; border-radius: 15px; font-weight: bold; cursor: pointer;">Shiny</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div style="border: 2px solid #FFC5BA; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>Category</div><div style="font-weight: bold;">${capitalize(species.genera.find(g => g.language.name === 'en').genus)}</div>
                    </div>
                    <div style="border: 2px solid #FFC5BA; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>Gender</div><div style="font-weight: bold; font-size: 18px;"><span style="color:#42A5F5;">♂</span> <span style="color:#EC407A;">♀</span></div>
                    </div>
                    <div style="border: 2px solid #FFC5BA; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>Abilities</div><div style="font-weight: bold;">${abilities}</div>
                    </div>
                    <div style="border: 2px solid #FFC5BA; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>Height</div><div style="font-weight: bold;">${this.pokemonData.height / 10} m</div>
                    </div>
                    <div style="border: 2px solid #FFC5BA; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>Weight</div><div style="font-weight: bold;">${this.pokemonData.weight / 10} kg</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    addEventListeners() {
        const closeBtn = this.domElement.getChildByID('profile-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        const normalBtn = this.domElement.getChildByID('normal-btn');
        const shinyBtn = this.domElement.getChildByID('shiny-btn');
        const spriteImg = this.domElement.getChildByID('profile-sprite');

        normalBtn.addEventListener('click', () => {
            spriteImg.src = this.pokemonData.sprites.front_default;
            normalBtn.style.background = '#EF8E18';
            normalBtn.style.color = 'white';
            normalBtn.style.borderColor = '#EF8E18';
            shinyBtn.style.background = 'white';
            shinyBtn.style.color = '#333';
            shinyBtn.style.borderColor = '#ddd';
        });

        shinyBtn.addEventListener('click', () => {
            spriteImg.src = this.pokemonData.sprites.front_shiny;
            shinyBtn.style.background = '#EF8E18';
            shinyBtn.style.color = 'white';
            shinyBtn.style.borderColor = '#EF8E18';
            normalBtn.style.background = 'white';
            normalBtn.style.color = '#333';
            normalBtn.style.borderColor = '#ddd';
        });
    }

    close() {
        // Animate out and destroy
        this.scene.tweens.add({
            targets: this.domElement,
            scale: 0.9,
            alpha: 0,
            duration: 150,
            ease: 'Power1',
            onComplete: () => {
                if (this.onClose) {
                    this.onClose();
                }
                this.destroy();
            }
        });
    }

    destroy() {
        if (this.domElement) {
            this.domElement.destroy();
            this.domElement = null;
        }
    }
}