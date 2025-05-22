-- Criar tabela de unidades se não existir
CREATE TABLE IF NOT EXISTS unidades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  sigla VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tamanhos se não existir
CREATE TABLE IF NOT EXISTS tamanhos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas unidades padrão se a tabela estiver vazia
INSERT INTO unidades (nome, sigla)
SELECT 'Unidade', 'UN'
WHERE NOT EXISTS (SELECT 1 FROM unidades LIMIT 1);

INSERT INTO unidades (nome, sigla)
SELECT 'Par', 'PR'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nome = 'Par');

INSERT INTO unidades (nome, sigla)
SELECT 'Caixa', 'CX'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nome = 'Caixa');

-- Inserir alguns tamanhos padrão se a tabela estiver vazia
INSERT INTO tamanhos (nome, ordem)
SELECT 'P', 1
WHERE NOT EXISTS (SELECT 1 FROM tamanhos LIMIT 1);

INSERT INTO tamanhos (nome, ordem)
SELECT 'M', 2
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = 'M');

INSERT INTO tamanhos (nome, ordem)
SELECT 'G', 3
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = 'G');

INSERT INTO tamanhos (nome, ordem)
SELECT 'GG', 4
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = 'GG');

INSERT INTO tamanhos (nome, ordem)
SELECT '36', 10
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '36');

INSERT INTO tamanhos (nome, ordem)
SELECT '38', 11
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '38');

INSERT INTO tamanhos (nome, ordem)
SELECT '40', 12
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '40');

INSERT INTO tamanhos (nome, ordem)
SELECT '42', 13
WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '42');
