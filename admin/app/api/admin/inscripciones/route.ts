import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createServerSupabase();
  const [inscRes, alumnasRes] = await Promise.all([
    supabase
      .from("inscripciones")
      .select("*, alumna:alumnas(id, nombre, apellido)")
      .order("created_at", { ascending: false }),
    supabase.from("alumnas").select("*").order("nombre"),
  ]);

  if (inscRes.error) return NextResponse.json({ error: inscRes.error.message }, { status: 500 });
  return NextResponse.json({ inscripciones: inscRes.data, alumnas: alumnasRes.data ?? [] });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("inscripciones").insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
