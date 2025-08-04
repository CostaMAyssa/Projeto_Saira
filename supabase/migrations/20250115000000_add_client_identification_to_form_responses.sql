-- Adicionar campos de identificação de clientes na tabela form_responses
-- Data: 2025-01-15
-- Descrição: Adiciona campos para identificar automaticamente clientes por telefone/email

-- Adicionar colunas para identificação de clientes
ALTER TABLE form_responses 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_form_responses_client_id ON form_responses(client_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_phone ON form_responses(phone);
CREATE INDEX IF NOT EXISTS idx_form_responses_email ON form_responses(email);

-- Adicionar comentários para documentação
COMMENT ON COLUMN form_responses.client_id IS 'Referência ao cliente identificado automaticamente';
COMMENT ON COLUMN form_responses.phone IS 'Telefone fornecido para identificação do cliente';
COMMENT ON COLUMN form_responses.email IS 'Email fornecido para identificação do cliente';

-- Criar função para normalizar números de telefone
CREATE OR REPLACE FUNCTION normalize_phone_number(phone TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF phone IS NULL OR phone = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remover todos os caracteres não numéricos
  normalized := regexp_replace(phone, '[^0-9]', '', 'g');
  
  -- Se começar com 55 (Brasil), remover
  IF normalized LIKE '55%' THEN
    normalized := substring(normalized from 3);
  END IF;
  
  -- Se começar com 0, remover
  IF normalized LIKE '0%' THEN
    normalized := substring(normalized from 2);
  END IF;
  
  RETURN normalized;
END;
$$ LANGUAGE plpgsql;

-- Criar função para identificar clientes automaticamente
CREATE OR REPLACE FUNCTION identify_client_by_contact(
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
  v_normalized_phone TEXT;
BEGIN
  -- Normalizar telefone se fornecido
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    v_normalized_phone := normalize_phone_number(p_phone);
    
    -- Tentar identificar por telefone normalizado
    SELECT id INTO v_client_id
    FROM clients
    WHERE normalize_phone_number(phone) = v_normalized_phone
    LIMIT 1;
    
    IF v_client_id IS NOT NULL THEN
      RETURN v_client_id;
    END IF;
  END IF;
  
  -- Tentar identificar por email
  IF p_email IS NOT NULL AND p_email != '' THEN
    SELECT id INTO v_client_id
    FROM clients
    WHERE email = p_email
    LIMIT 1;
    
    IF v_client_id IS NOT NULL THEN
      RETURN v_client_id;
    END IF;
  END IF;
  
  -- Cliente não encontrado
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar client_id automaticamente
CREATE OR REPLACE FUNCTION update_form_response_client_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se client_id não foi fornecido, tentar identificar automaticamente
  IF NEW.client_id IS NULL AND (NEW.phone IS NOT NULL OR NEW.email IS NOT NULL) THEN
    NEW.client_id := identify_client_by_contact(NEW.phone, NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela form_responses
DROP TRIGGER IF EXISTS trigger_update_form_response_client_id ON form_responses;
CREATE TRIGGER trigger_update_form_response_client_id
  BEFORE INSERT ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_form_response_client_id(); 