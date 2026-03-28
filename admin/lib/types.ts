export interface Alumna {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  fecha_alta: string;
  notas: string;
  activa: boolean;
  created_at: string;
}

export interface Pago {
  id: string;
  alumna_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  concepto: string;
  estado: "pagado" | "pendiente" | "cancelado";
  created_at: string;
  alumna?: Alumna;
}

export interface Inscripcion {
  id: string;
  alumna_id: string;
  clase: string;
  dia_semana: string;
  horario: string;
  fecha_inscripcion: string;
  estado: "activa" | "pausada" | "cancelada";
  created_at: string;
  alumna?: Alumna;
}

export interface Clase {
  id: string;
  nombre: string;
  descripcion: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
  activa: boolean;
  created_at: string;
  inscritas?: number;
}

export interface Asistencia {
  id: string;
  alumna_id: string;
  clase_id: string;
  fecha: string;
  asistio: boolean;
  notas: string;
  created_at: string;
  alumna?: Alumna;
  clase?: Clase;
}

export interface Contenido {
  id: string;
  titulo: string;
  tipo: "ejercicio" | "video" | "documento" | "enlace";
  descripcion: string;
  url: string;
  contenido_texto: string;
  visible: boolean;
  orden: number;
  created_at: string;
}
