-- Adicionar a coluna unidade_id à tabela produtos se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'produtos' 
        AND column_name = 'unidade_id'
    ) THEN
        ALTER TABLE produtos ADD COLUMN unidade_id INTEGER;
    END IF;
END $$;
