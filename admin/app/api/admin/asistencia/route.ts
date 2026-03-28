import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const clase_id = searchParams.get("clase_id");
  const alumna_id = searchParams.get("alumna_id");

  const supabase = createServerSupabase();
  let query = supabase
    .from("asistencias")
    .select("*, alumna:alumnas(id, nombre, apellido), clase:clases(id, nombre, dia_semana)")
    .order("fecha", { ascending: false });

  if (fecha) query = query.eq("fecha", fecha);
  if (clase_id) query = query.eq("clase_id", clase_id);
  if (alumna_id) query = query.eq("alumna_id", alumna_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const supabase = createServerSupabase();

  // Support bulk insert (array of records)
  if (Array.isArray(body)) {
    const { data, error } = await supabase.from("asistencias").upsert(body, {
      onConflict: "alumna_id,clase_id,fecha",
      ignoreDuplicates: false,
    }).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  const { data, error } = await supabase.from("asistencias").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
