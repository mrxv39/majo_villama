import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createServerSupabase();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

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

  return NextResponse.json({
    stats: {
      inscripcionesNuevas: inscMesRes.count ?? 0,
      alumnasActivas: alumnasRes.count ?? 0,
      pagosPendientes: pagosPendRes.count ?? 0,
      clasesEsteMes: clasesRes.count ?? 0,
    },
    pagosRecientes: pagosRecientes.data ?? [],
    inscRecientes: inscRecientes.data ?? [],
  });
}
