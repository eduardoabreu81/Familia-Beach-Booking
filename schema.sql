-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    apartmentId TEXT NOT NULL,
    guestName TEXT NOT NULL,
    startDate TEXT NOT NULL, -- Format: YYYY-MM-DD
    endDate TEXT NOT NULL,   -- Format: YYYY-MM-DD
    color TEXT NOT NULL,
    notes TEXT,
    email TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações dos Apartamentos
CREATE TABLE IF NOT EXISTS apartment_settings (
    id TEXT PRIMARY KEY, -- 'caragua' or 'praia_grande'
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    photoUrl TEXT NOT NULL,
    rules TEXT NOT NULL -- JSON stringified array
);

-- Tabela de Usuários/Familiares
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    email TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais (Seed) se não existirem
INSERT INTO apartment_settings (id, name, location, photoUrl, rules)
VALUES 
    ('caragua', 'Apto Caraguatatuba', 'Rua da Praia, 123 - Caraguatatuba, SP', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2', '["Check-in após as 14h", "Levar roupa de cama", "Proibido som alto após 22h"]'),
    ('praia_grande', 'Apto Praia Grande', 'Av. Castelo Branco, 456 - Praia Grande, SP', 'https://images.unsplash.com/photo-1520483601770-b351370433d9', '["Check-out até as 12h", "Não aceita pets", "Recolher o lixo na saída"]')
ON CONFLICT (id) DO NOTHING;
