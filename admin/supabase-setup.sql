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

-- Habilitar RLS en todas las tablas
ALTER TABLE alumnas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS automáticamente en Supabase.
-- No se crean políticas para anon — todo el acceso CRUD va
-- a través de API routes server-side con service_role key.

-- Tabla de clases
CREATE TABLE IF NOT EXISTS clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  dia_semana TEXT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  capacidad INTEGER DEFAULT 10,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clases ENABLE ROW LEVEL SECURITY;

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  fecha DATE DEFAULT CURRENT_DATE,
  asistio BOOLEAN DEFAULT true,
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumna_id, clase_id, fecha)
);

ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Tabla de contenido
CREATE TABLE IF NOT EXISTS contenido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ejercicio', 'video', 'documento', 'enlace')),
  descripcion TEXT DEFAULT '',
  url TEXT DEFAULT '',
  contenido_texto TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;

-- Datos de ejemplo para clases
INSERT INTO clases (nombre, dia_semana, hora_inicio, hora_fin, capacidad) VALUES
  ('Feldenkrais Grupal', 'Martes', '10:00', '11:00', 12),
  ('Feldenkrais Grupal', 'Jueves', '10:00', '11:00', 12),
  ('Sesión Individual', 'Lunes', '16:00', '17:00', 1),
  ('Sesión Individual', 'Miércoles', '16:00', '17:00', 1),
  ('Taller Monográfico', 'Sábado', '10:00', '12:00', 15),
  ('Clase Online', 'Viernes', '18:00', '19:00', 20);

-- Datos de ejemplo
INSERT INTO alumnas (nombre, apellido, email, telefono, notas, activa) VALUES
  ('Maria', 'Garcia Lopez', 'maria.garcia@email.com', '+34 612 345 678', 'Clase de los martes', true),
  ('Ana', 'Martinez Ruiz', 'ana.martinez@email.com', '+34 623 456 789', 'Tiene problemas de espalda', true),
  ('Laura', 'Fernandez Diaz', 'laura.fdez@email.com', '+34 634 567 890', '', true),
  ('Carmen', 'Lopez Sanchez', NULL, '+34 645 678 901', 'Clase grupal miercoles', true),
  ('Isabel', 'Rodriguez Perez', 'isabel.rp@email.com', '+34 656 789 012', 'Sesion individual', false);
