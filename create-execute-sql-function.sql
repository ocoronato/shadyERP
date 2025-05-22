-- Criar função para executar SQL
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
