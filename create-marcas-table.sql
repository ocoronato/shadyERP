-- Criar tabela de marcas
CREATE TABLE IF NOT EXISTS marcas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna marca na tabela produtos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'marca'
  ) THEN
    ALTER TABLE produtos ADD COLUMN marca VARCHAR(255);
  END IF;
END $$;

-- Inserir algumas marcas de exemplo
INSERT INTO marcas (nome) VALUES 
  ('Nike'),
  ('Adidas'),
  ('Puma'),
  ('Reebok'),
  ('New Balance')
ON CONFLICT (nome) DO NOTHING;
