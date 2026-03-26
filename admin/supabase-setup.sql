-- ============================================
-- Majo Villama Admin - Supabase Setup
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Tabla de alumnas
CREATE TABLE IF NOT EXISTS alumnas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  fecha_alta DATE DEFAULT CURRENT_DATE,
  notas TEXT DEFAULT '',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE DEFAULT CURRENT_DATE,
  metodo_pago TEXT DEFAULT 'efectivo',
  concepto TEXT DEFAULT '',
  estado TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  clase TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario TEXT NOT NULL,
  fecha_inscripcion DATE DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS para simplificar (la app ya tiene auth con NextAuth)
ALTER TABLE alumnas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones DISABLE ROW LEVEL SECURITY;

-- Datos de ejemplo
INSERT INTO alumnas (nombre, apellido, email, telefono, notas, activa) VALUES
  ('Maria', 'Garcia Lopez', 'maria.garcia@email.com', '+34 612 345 678', 'Clase de los martes', true),
  ('Ana', 'Martinez Ruiz', 'ana.martinez@email.com', '+34 623 456 789', 'Tiene problemas de espalda', true),
  ('Laura', 'Fernandez Diaz', 'laura.fdez@email.com', '+34 634 567 890', '', true),
  ('Carmen', 'Lopez Sanchez', NULL, '+34 645 678 901', 'Clase grupal miercoles', true),
  ('Isabel', 'Rodriguez Perez', 'isabel.rp@email.com', '+34 656 789 012', 'Sesion individual', false);
