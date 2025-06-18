const BASE_URL = 'https://pokeapi.co/api/v2';

// Fungsi untuk mengambil data dasar Pokemon
export async function getPokemonData(nameOrId) {
    try {
        const response = await fetch(`${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokemon not found!');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        return null;
    }
}

//Fungsi mengambil data lengkap untuk satu Berry berdasarkan nama atau ID.
export async function getBerry(nameOrId) {
    const processedInput = nameOrId.toString().toLowerCase();
    try {
        const response = await fetch(`${BASE_URL}/berry/${processedInput}`);
        if (!response.ok) {
            throw new Error(`Berry "${nameOrId}" tidak ditemukan.`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Gagal mengambil data Berry: ${error.message}`);
        return null;
    }
}

//Helper function untuk mengekstrak URL sprite yang paling berguna dari data Pokémon.
export function extractPokemonSprites(pokemonData) {
    if (!pokemonData || !pokemonData.sprites) {
        console.warn("Data Pokémon tidak valid untuk mengekstrak sprite.");
        return null;
    }

    // Cari sprite animasi dari data 'versions'
    const animatedSprite = pokemonData.sprites.versions['generation-v']['black-white'].animated.front_default;

    return {
        // Sprite pixel-art klasik (statis)
        default: pokemonData.sprites.front_default,
        // Sprite modern dengan resolusi tinggi (statis)
        official: pokemonData.sprites.other['official-artwork'].front_default,
        // Sprite gaya lain (statis)
        dreamWorld: pokemonData.sprites.other.dream_world.front_default,
        // Sprite animasi (GIF)
        animated: animatedSprite 
    };
}

//Mengambil URL sprite untuk sebuah Berry.
export async function getBerrySpriteUrl(berryData) {
    if (!berryData || !berryData.item || !berryData.item.url) {
        console.warn("Data Berry tidak valid untuk mengambil sprite.");
        return null;
    }

    try {
        const response = await fetch(berryData.item.url);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data item untuk Berry.`);
        }
        const itemData = await response.json();
        
        // Pastikan sprite ada di dalam data item
        if (itemData.sprites && itemData.sprites.default) {
            return itemData.sprites.default;
        } else {
            throw new Error(`Sprite tidak ditemukan untuk item ini.`);
        }
    } catch (error) {
        console.error(`Gagal mengambil sprite Berry: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mengambil rantai evolusi (ini memerlukan 2 panggilan)
export async function getEvolutionChain(pokemonData) {
    try {
        // 1. Ambil URL spesies dari data pokemon
        const speciesResponse = await fetch(pokemonData.species.url);
        if (!speciesResponse.ok) throw new Error('Could not fetch species data.');
        const speciesData = await speciesResponse.json();

        // 2. Ambil URL rantai evolusi dari data spesies
        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionChainResponse.ok) throw new Error('Could not fetch evolution chain.');
        const evolutionChainData = await evolutionChainResponse.json();
        
        return evolutionChainData;
    } catch (error) {
        console.error("Error fetching evolution chain:", error);
        return null;
    }
}