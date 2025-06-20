import * as PokeAPI from '../game/PokeAPIService.js';

export default class FeedPopup extends Phaser.GameObjects.Container {
    constructor(scene, x, y, petInstance) {
        super(scene, x, y);
        this.scene = scene;
        this.petInstance = petInstance;
        
        this.setDepth(100);
        scene.add.existing(this);

        const bg = scene.add.image(0, 0, 'feed-box').setScale(0.7).setOrigin(0, 0);
        this.add(bg);
        const closeButton = scene.add.image(bg.displayWidth - 15, 15, 'closeButton')
            .setScale(0.4).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', this.closePopup, this);
        this.add(closeButton);

        // Container untuk grid, agar mudah dihapus dan dibuat ulang
        this.gridContainer = scene.add.container(0, 0);
        this.add(this.gridContainer);

        this.refreshGrid();
        
        // Dengarkan event perubahan inventaris untuk me-refresh grid
        this.petInstance.on('onInventoryChange', this.refreshGrid, this);
    }

    populateGrid() {
        this.refreshGrid();
    }

    async createPopup() {
        // Background popup
        const bg = this.scene.add.image(0, 0, 'feed-box').setScale(0.8).setOrigin(0.5, 1);
        this.add(bg); // Tambahkan bg ke container ini

        // Teks feedback
        const feedbackText = this.scene.add.text(0, -bg.displayHeight/2, 'Loading...', { fontFamily: 'Pixelify Sans', fontSize: '20px' }).setOrigin(0.5);
        feedbackText.setName('feedbackText');
        this.add(feedbackText);

        // Tombol close
        const closeButton = this.scene.add.image(bg.displayWidth/2 - 20, -bg.displayHeight + 20, 'closeButton').setScale(0.4).setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', this.closePopup, this);
        this.add(closeButton);
        
        // Mulai proses memuat dan menampilkan grid berry
        await this.refreshGrid();
    }
    
    // Fungsi ini dipanggil pertama kali dan setiap kali inventaris berubah
    refreshGrid() {
        this.gridContainer.removeAll(true);
        const inventory = this.petInstance.stats.inventory.Berries || {};
        const berryNames = Object.keys(inventory);

        if (berryNames.length === 0) {
            const noBerriesText = this.scene.add.text(this.list[0].displayWidth / 2, 100, 'No berries!', {
                fontFamily: 'Pixelify Sans', fontSize: '20px'
            }).setOrigin(0.5);
            this.gridContainer.add(noBerriesText);
            return;
        }

        const gridCols = 3;
        const colWidth = 80;
        const rowHeight = 80;
        const startX = 45;
        const startY = 60;

        berryNames.forEach((name, index) => {
            if (inventory[name] > 0 && this.scene.textures.exists(`berry_${name}`)) {
                const row = Math.floor(index / gridCols);
                const col = index % gridCols;
                const x = startX + col * colWidth;
                const y = startY + row * rowHeight;

                const itemContainer = this.scene.add.container(x, y);
                itemContainer.setSize(70, 70);
                itemContainer.setInteractive({ cursor: 'pointer' });

                const itemBg = this.scene.add.graphics().fillStyle(0xdcc8ff, 1).fillRoundedRect(-35, -35, 70, 70, 10);
                const berrySprite = this.scene.add.image(0, -5, `berry_${name}`).setScale(1.2);
                const countText = this.scene.add.text(20, 25, `x${inventory[name]}`, { fontFamily: 'Pixelify Sans', fontSize: '14px', color: '#333' }).setOrigin(0.5);
                itemContainer.add([itemBg, berrySprite, countText]);

                const berryNameToFeed = name; 

                itemContainer.on('pointerdown', () => {
                    console.log(`Clicked on: ${berryNameToFeed}`);
                    if (this.petInstance.stats.inventory.Berries[berryNameToFeed] > 0) {
                        this.petInstance.feed(berryNameToFeed);
                    }
                });

                this.gridContainer.add(itemContainer);
            } else {
                if (!this.scene.textures.exists(`berry_${name}`)) {
                    console.warn(`Texture 'berry_${name}' tidak ditemukan saat mencoba membuat grid.`);
                }
            }
        });
    }

    closePopup() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.9,
            duration: 150,
            ease: 'Power1',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    // Override fungsi destroy untuk membersihkan event listener
    destroy(fromScene) {
        // Hapus listener dari pet agar tidak terjadi memory leak
        this.petInstance.off('onInventoryChange', this.refreshGrid, this);
        // Panggil destroy dari parent class
        super.destroy(fromScene);
    }
}