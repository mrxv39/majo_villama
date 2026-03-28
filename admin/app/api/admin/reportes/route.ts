import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mes = parseInt(searchParams.get("mes") || String(new Date().getMonth() + 1));
  const anio = parseInt(searchParams.get("anio") || String(new Date().getFullYear()));

  const firstDay = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const lastDay = new Date(anio, mes, 0).toISOString().split("T")[0];

  const supabase = createServerSupabase();

  const [alumnasRes, inscNuevasRes, inscCancelRes, pagosRes, pendientesRes] = await Promise.all([
    supabase.from("alumnas").select("id", { count: "exact" }).eq("activa", true),
    supabase
      .from("inscripciones")
      .select("id", { count: "exact" })
      .gte("fecha_inscripcion", firstDay)
      .lte("fecha_inscripcion", lastDay),
    supabase
      .from("inscripciones")
      .select("id", { count: "exact" })
      .eq("estado", "cancelada")
      .gte("created_at", firstDay)
      .lte("created_at", lastDay + "T23:59:59"),
    supabase
      .from("pagos")
      .select("*")
      .gte("fecha_pago", firstDay)
      .lte("fecha_pago", lastDay),
    supabase
      .from("pagos")
      .select("*, alumna:alumnas(nombre, apellido)")
      .eq("estado", "pendiente"),
  ]);

  const pagos = pagosRes.data ?? [];
  const totalCobrado = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + Number(p.monto), 0);
  const totalPendiente = pagos
    .filter((p) => p.estado === "pendiente")
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const porMetodo: Record<string, number> = {};
  for (const p of pagos.filter((p) => p.estado === "pagado")) {
    porMetodo[p.metodo_pago] = (porMetodo[p.metodo_pago] || 0) + Number(p.monto);
  }

  return NextResponse.json({
    alumnasActivas: alumnasRes.count ?? 0,
    inscripcionesNuevas: inscNuevasRes.count ?? 0,
    inscripcionesCanceladas: inscCancelRes.count ?? 0,
    totalCobrado,
    totalPendiente,
    porMetodo,
    pagosPendientes: pendientesRes.data ?? [],
  });
}
