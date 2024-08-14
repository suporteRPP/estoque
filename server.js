const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'data', 'estoque.js');

// Função para ler os dados do arquivo JavaScript
const readData = () => {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, 'module.exports = [];'); // Cria o arquivo se não existir
    }
    return require(dbPath);
};

// Função para escrever os dados no arquivo JavaScript
const writeData = (data) => {
    fs.writeFileSync(dbPath, `module.exports = ${JSON.stringify(data, null, 2)};`);
};

// Endpoint para listar todos os produtos
app.get('/api/products', (req, res) => {
    const products = readData();
    res.json(products);
});

// Endpoint para adicionar ou atualizar um produto
app.post('/api/products', (req, res) => {
    const products = readData();
    const { id, nome, tipo, quantidade } = req.body;
    const existingProductIndex = products.findIndex(p => p.id === id);

    if (existingProductIndex !== -1) {
        // Atualiza o produto existente
        const existingProduct = products[existingProductIndex];
        if (quantidade !== undefined) {
            existingProduct.quantidade = quantidade;
        }
        writeData(products);
        res.status(200).json(existingProduct);
    } else {
        // Adiciona um novo produto
        if (nome === undefined || tipo === undefined) {
            return res.status(400).send('Nome e Tipo são obrigatórios para novos produtos.');
        }
        const newProduct = { id, nome, tipo, quantidade };
        products.push(newProduct);
        writeData(products);
        res.status(201).json(newProduct);
    }
});

// Endpoint para remover uma quantidade específica de um produto
app.patch('/api/products/:id/remove', (req, res) => {
    const products = readData();
    const { id } = req.params;
    const { quantity } = req.body;

    const product = products.find(p => p.id === id);
    if (product) {
        if (product.quantidade >= quantity) {
            product.quantidade -= quantity;
            writeData(products);
            res.json(product);
        } else {
            res.status(400).send('Quantidade insuficiente');
        }
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

// Endpoint para deletar um produto
app.delete('/api/products/:id', (req, res) => {
    let products = readData();
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    writeData(products);
    res.status(204).send();
});

// Endpoint para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
