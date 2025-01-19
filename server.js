const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('./'));

// Cargar productos desde db.json al iniciar
let products = [];
if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    products = JSON.parse(data);
}


// Obtener productos
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Agregar un nuevo producto
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const newProduct = { name, price, imageUrl };
    products.push(newProduct);

    // Guardar en db.json
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');

    res.status(201).json({ message: 'Producto agregado', product: newProduct });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
