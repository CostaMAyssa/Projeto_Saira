-- Função para decrementar o estoque de um produto
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, quantidade INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Verificar se o produto existe e tem estoque suficiente
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id AND stock >= quantidade) THEN
    RAISE EXCEPTION 'Produto não encontrado ou estoque insuficiente';
  END IF;
  
  -- Decrementar o estoque
  UPDATE products
  SET stock = stock - quantidade
  WHERE id = product_id;
  
END;
$$ LANGUAGE plpgsql;