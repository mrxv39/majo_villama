import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createServerSupabase();

  const [alumnaRes, pagosRes, inscRes] = await Promise.all([
    supabase.from("alumnas").select("*").eq("id", id).single(),
    supabase
      .from("pagos")
      .select("*")
      .eq("alumna_id", id)
      .order("fecha_pago", { ascending: false }),
    supabase
      .from("inscripciones")
      .select("*")
      .eq("alumna_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (alumnaRes.error)
    return NextResponse.json({ error: alumnaRes.error.message }, { status: 404 });

  return NextResponse.json({
    alumna: alumnaRes.data,
    pagos: pagosRes.data ?? [],
    inscripciones: inscRes.data ?? [],
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createServerSupabase();
  const { error } = await supabase.from("alumnas").update(body).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase.from("alumnas").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
