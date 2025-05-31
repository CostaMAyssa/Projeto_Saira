-- Adiciona tabela de configurações do WhatsApp
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    instance_name TEXT,
    global_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insere configuração padrão
INSERT INTO settings (id, evolution_api_url, evolution_api_key, instance_name, global_mode)
VALUES ('whatsapp', '', '', '', false)
ON CONFLICT (id) DO NOTHING; 