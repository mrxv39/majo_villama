import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createServerSupabase();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Basic stats (same as before)
  const [alumnasRes, inscMesRes, pagosPendRes, clasesRes, pagosRecientes, inscRecientes] =
    await Promise.all([
      supabase.from("alumnas").select("id", { count: "exact" }).eq("activa", true),
      supabase
        .from("inscripciones")
        .select("id", { count: "exact" })
        .gte("fecha_inscripcion", firstOfMonth),
      supabase.from("pagos").select("id", { count: "exact" }).eq("estado", "pendiente"),
      supabase
        .from("inscripciones")
        .select("clase", { count: "exact" })
        .eq("estado", "activa"),
      supabase
        .from("pagos")
        .select("id, monto, fecha_pago, estado, alumna:alumnas(nombre, apellido)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("inscripciones")
        .select("id, clase, fecha_inscripcion, alumna:alumnas(nombre, apellido)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  // Monthly payments (last 6 months)
  const pagosMensuales: { mes: string; total: number }[] = [];
  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString().split("T")[0];
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const { data: pagos } = await supabase
      .from("pagos")
      .select("monto")
      .eq("estado", "pagado")
      .gte("fecha_pago", start)
      .lte("fecha_pago", end);
    const total = (pagos ?? []).reduce((s, p) => s + Number(p.monto), 0);
    pagosMensuales.push({ mes: mesesNombres[d.getMonth()], total });
  }

  // Clases hoy
  const hoyDia = diasNombres[now.getDay()];
  const { data: clasesData } = await supabase
    .from("clases")
    .select("id, nombre, hora_inicio, hora_fin")
    .eq("activa", true)
    .eq("dia_semana", hoyDia);

  const clasesHoy: { nombre: string; hora_inicio: string; hora_fin: string; inscritas: number }[] = [];
  for (const c of clasesData ?? []) {
    const { count } = await supabase
      .from("inscripciones")
      .select("id", { count: "exact" })
      .eq("estado", "activa");
    clasesHoy.push({ ...c, inscritas: count ?? 0 });
  }

  // Deudores (alumnas with pending payments)
  const { data: pendientes } = await supabase
    .from("pagos")
    .select("monto, alumna:alumnas(nombre, apellido)")
    .eq("estado", "pendiente");

  const deudorMap: Record<string, { nombre: string; monto: number }> = {};
  for (const p of pendientes ?? []) {
    const a = p.alumna as unknown as { nombre: string; apellido: string } | null;
    const nombre = a ? `${a.nombre} ${a.apellido}` : "Desconocida";
    if (!deudorMap[nombre]) deudorMap[nombre] = { nombre, monto: 0 };
    deudorMap[nombre].monto += Number(p.monto);
  }
  const deudores = Object.values(deudorMap).sort((a, b) => b.monto - a.monto).slice(0, 5);

  // Asistencia semana
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const mondayStr = monday.toISOString().split("T")[0];
  const { data: asistSemana } = await supabase
    .from("asistencias")
    .select("asistio")
    .gte("fecha", mondayStr);
  const asistTotal = asistSemana?.length ?? 0;
  const asistPresentes = asistSemana?.filter((a) => a.asistio).length ?? 0;

  return NextResponse.json({
    stats: {
      inscripcionesNuevas: inscMesRes.count ?? 0,
      alumnasActivas: alumnasRes.count ?? 0,
      pagosPendientes: pagosPendRes.count ?? 0,
      clasesEsteMes: clasesRes.count ?? 0,
    },
    pagosRecientes: pagosRecientes.data ?? [],
    inscRecientes: inscRecientes.data ?? [],
    pagosMensuales,
    clasesHoy,
    deudores,
    asistenciaSemana: { total: asistTotal, presentes: asistPresentes },
  });
}
