document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const productList = document.getElementById('product-list');

    const apiUrl = '/api/products';

    // Função para atualizar a tabela de produtos
    const updateProductList = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Erro ao buscar produtos');
            const products = await response.json();
            productList.innerHTML = ''; // Limpa a tabela existente
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nome || 'N/A'}</td>
                    <td>${product.quantidade}</td>
                    <td>${product.tipo || 'N/A'}</td>
                    <td class="remove-column">
                        <input type="number" class="remove-quantity" data-id="${product.id}" placeholder="Quantidade">
                    </td>
                    <td class="remove-column">
                        <button class="remove-button" data-id="${product.id}">Retirada</button>
                    </td>
                `;
                productList.appendChild(row);
            });
            attachRemoveEventListeners(); // Reanexa os ouvintes de evento após atualizar a lista
        } catch (error) {
            console.error('Erro ao atualizar a tabela de produtos:', error);
        }
    };

    // Adiciona um produto
    const addProduct = async () => {
        const id = document.getElementById('product-id').value;
        const nome = document.getElementById('product-name').value;
        const quantidade = parseInt(document.getElementById('product-quantity').value, 10);
        const tipo = document.getElementById('product-type').value;

        if (!id || isNaN(quantidade) || quantidade <= 0) {
            alert('Preencha todos os campos obrigatórios corretamente.');
            return;
        }

        const productData = { id, quantidade };

        if (nome) productData.nome = nome;
        if (tipo) productData.tipo = tipo;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Erro ao adicionar produto');
            await response.json();
            form.reset();
            updateProductList();
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
        }
    };

    // Remove quantidade de um produto
    const removeProductQuantity = async (id, quantity) => {
        try {
            const response = await fetch(`/api/products/${id}/remove`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            if (!response.ok) throw new Error('Erro ao remover quantidade');
            await response.json();
            updateProductList();
        } catch (error) {
            console.error('Erro ao remover quantidade:', error);
        }
    };

    // Adiciona o evento de clique ao botão "Adicionar"
    document.getElementById('add-button').addEventListener('click', addProduct);

    // Adiciona o evento de clique ao botão "Retirada"
    const attachRemoveEventListeners = () => {
        const removeButtons = document.querySelectorAll('.remove-button');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const id = button.getAttribute('data-id');
                const quantityInput = document.querySelector(`.remove-quantity[data-id="${id}"]`);
                const quantity = parseInt(quantityInput.value, 10);

                if (isNaN(quantity) || quantity <= 0) {
                    alert('Digite uma quantidade válida para retirada.');
                    return;
                }

                await removeProductQuantity(id, quantity);
            });
        });
    };

    // Inicializa a lista de produtos
    updateProductList();
});
