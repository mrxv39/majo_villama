import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clases")
    .select("*")
    .order("dia_semana")
    .order("hora_inicio");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Count inscritas per clase
  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select("clase_id")
    .eq("estado", "activa");

  const countMap: Record<string, number> = {};
  for (const i of inscripciones ?? []) {
    countMap[i.clase_id] = (countMap[i.clase_id] || 0) + 1;
  }

  const clases = (data ?? []).map((c) => ({
    ...c,
    inscritas: countMap[c.id] || 0,
  }));

  return NextResponse.json(clases);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("clases").insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
