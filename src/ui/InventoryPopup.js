export default class InventoryPopup extends Phaser.GameObjects.Container {
    constructor(scene, x, y, petInstance) {
        super(scene, x, y);
        this.scene = scene;
        this.petInstance = petInstance;
        this.itemTexts = []; 

        scene.add.existing(this);

        this.setDepth(100);
        this.createPopup();

        // Tambahkan listener untuk update UI saat inventaris berubah
        this.petInstance.on('onInventoryChange', this.updateItemList, this);
    }

    createPopup() {
        const bg = this.scene.add.image(0, 0, 'inventory').setOrigin(0.5).setScale(0.5);
        this.add(bg);

        // 2. Tombol Close
        const closeButton = this.scene.add.image(bg.displayWidth / 2 - 35, -bg.displayHeight / 2 + 35, 'closeButton')
            .setScale(0.6)
            .setOrigin(0.5)
            .setInteractive({ cursor: 'pointer' });
        
        closeButton.on('pointerdown', this.close, this);
        this.add(closeButton);
        
        // 3. Container untuk daftar item, agar mudah di-refresh
        this.itemListContainer = this.scene.add.container(0, 0);
        this.add(this.itemListContainer);
        
        // 4. Buat dan tampilkan daftar item awal
        this.updateItemList();
    }

    updateItemList() {
        // Hapus item lama sebelum menggambar ulang
        this.itemListContainer.removeAll(true);
        this.itemTexts = [];

        // Gabungkan semua item dari kategori yang berbeda
        const inventory = this.petInstance.stats.inventory;
        const allItems = {
            ...inventory.General,
            'Berries': Object.values(inventory.Berries).reduce((sum, count) => sum + count, 0)
        };

        const itemNames = Object.keys(allItems);

        // --- PERUBAHAN KUNCI #4: Sesuaikan Tata Letak Teks untuk Ukuran Baru ---
        const bgRef = this.list[0]; // Ambil referensi background yang sudah diskalakan
        const startY = -bgRef.displayHeight / 2 + 120; // Mulai lebih rendah
        const lineHeight = 55;  // Beri jarak lebih besar
        const nameX = -bgRef.displayWidth / 2 + 250; // Beri padding kiri lebih banyak
        const countX = bgRef.displayWidth / 2 - 50;  // Beri padding kanan lebih banyak

        if (itemNames.length === 0 || (itemNames.length === 1 && itemNames[0] === 'Berries' && allItems['Berries'] === 0)) {
            const emptyText = this.scene.add.text(0, 0, 'Bag is empty.', {
                fontFamily: 'Pixelify Sans', fontSize: '20px', color: '#5c3e27'
            }).setOrigin(0.5);
            this.itemListContainer.add(emptyText);
            return;
        }

        itemNames.forEach((name, index) => {
            if (name === 'Berries' && allItems[name] === 0) return;
            const yPos = startY + (index * lineHeight);
            const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            const nameText = this.scene.add.text(nameX, yPos, formattedName, {
                fontFamily: 'Arial',
                fontSize: '20px', // Perbesar font
                color: '#3d3d3d',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            const countText = this.scene.add.text(countX, yPos, `x ${allItems[name]}`, {
                fontFamily: 'Arial',
                fontSize: '20px', // Perbesar font
                color: '#3d3d3d',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);

            this.itemListContainer.add([nameText, countText]);
            this.itemTexts.push({ name: nameText, count: countText });
        });
    }

    close() {
        // Animasi saat menutup popup
        this.scene.tweens.add({
            targets: this,
            scale: 0.9,
            alpha: 0,
            duration: 150,
            ease: 'Power1',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    // Override destroy untuk membersihkan listener
    destroy(fromScene) {
        this.petInstance.off('onInventoryChange', this.updateItemList, this);
        super.destroy(fromScene);
    }
}