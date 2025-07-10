// Importar os módulos necessários
const express = require('express');
// Criar um objeto de rotas do Express
const routes = express.Router();
// Importar a conexão com o banco de dados
const db = require('../db/connect');

// ==============================
// ROTA GET (Read) - Buscar dados
// ==============================
routes.get('/', async (req, res) => {
  // Consulta todos os dados da tabela "produto"
  const result = await db.query('SELECT * FROM produto');
  // Retorna os dados encontrados com status 200
  res.status(200).json(result.rows);
});

// ===================================
// ROTA POST (Create) - Inserir dados
// ===================================
routes.post('/', async (req, res) => {
  // Extrai os dados do corpo da requisição
  const { nome, marca, preco, peso } = req.body;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!nome || !marca || !preco || !peso) {
    return res.status(400).json({
      mesagem: 'Todos os campos são obrigatórios'
    });
  }

  // SQL para inserir novo produto no banco
  const sql = `INSERT INTO produto (nome, marca, preco, peso)
                VALUES ($1, $2, $3, $4) RETURNING *`;

  // Define os valores a serem inseridos
  const valores = [nome, marca, preco, peso];

  // Executa a query e salva o resultado
  const result = await db.query(sql, valores);

  // Retorna o produto inserido com status 201
  res.status(201).json(result.rows[0]);
});

// ====================================
// ROTA PUT (Update) - Atualizar dados
// ====================================
routes.put('/:id', async (req, res) => {
  // Extrai o ID dos parâmetros da rota
  const { id } = req.params;

  // Verifica se o ID foi informado
  if (!id) {
    return res.status(400).json({
      mensagem: 'O id precisa ser informado'
    });
  }

  // Extrai os novos dados do corpo da requisição
  const { nome, marca, preco, peso } = req.body;

  // Verifica se todos os campos foram preenchidos
  if (!nome || !marca || !preco || !peso) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios.'
    });
  }

  // SQL para atualizar os dados do produto com base no ID
  const sql = `
    UPDATE produto
    SET nome = $1, marca = $2, preco = $3, peso = $4
    WHERE id = $5
    RETURNING *
  `;

  // Define os valores da atualização
  const valores = [nome, marca, preco, peso, id];

  // Executa a query
  const result = await db.query(sql, valores);

  // Verifica se algum produto foi atualizado
  if (result.rows.length === 0) {
    return res.status(404).json({
      mensagem: 'Cliente não encontrado.'
    });
  }

  // Retorna o produto atualizado
  res.status(200).json(result.rows[0]);
});

// =====================================
// ROTA DELETE (Delete) - Remover dados
// =====================================
routes.delete('/:id', async (req, res) => {
  // Extrai o ID dos parâmetros da rota
  const { id } = req.params;

  // Verifica se o ID foi informado
  if (!id) {
    return res.status(400).json({
      mensagem: 'O id precisa ser informado'
    });
  }

  // SQL para deletar o produto com base no ID
  const sql = `
    DELETE FROM produto
    WHERE id = $1
    RETURNING *
  `;

  // Define o valor do ID para a query
  const valores = [id];

  // Executa a query
  const result = await db.query(sql, valores);

  // Verifica se algum produto foi deletado
  if (result.rows.length === 0) {
    return res.status(404).json({
      mensagem: 'Cliente não encontrado.'
    });
  }

  // Retorna mensagem de sucesso
  res.status(200).json({
    mensagem: `Cliente com ID ${id} foi excluído com sucesso`
  });
});

// Exportar o objeto de rotas para ser usado no app principal
module.exports = routes;
