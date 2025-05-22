-- Adicionar coluna unidade_id à tabela produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS unidade_id INTEGER;

-- Adicionar coluna tipo_estoque com valor padrão "unidade"
ALTER TABLE produtos 
ALTER COLUMN tipo_estoque TYPE VARCHAR(20);

-- Atualizar os valores existentes
UPDATE produtos 
SET tipo_estoque = 'unidade' 
WHERE tipo_estoque = 'par';

-- Atualizar o tipo de estoque para o novo formato
UPDATE produtos 
SET tipo_estoque = 'tamanho' 
WHERE tipo_estoque = 'par';
