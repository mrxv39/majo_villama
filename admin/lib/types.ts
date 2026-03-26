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
