"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Inscripcion, Alumna } from "@/lib/types";

const clases = [
  "Feldenkrais Grupal",
  "Sesión Individual",
  "Taller Monográfico",
  "Clase Online",
];

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const emptyInscripcion = {
  alumna_id: "",
  clase: clases[0],
  dia_semana: diasSemana[0],
  horario: "10:00",
  estado: "activa" as const,
};

export default function InscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [alumnas, setAlumnas] = useState<Alumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Inscripcion | null>(null);
  const [form, setForm] = useState(emptyInscripcion);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterAlumna, setFilterAlumna] = useState("todas");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [inscRes, alumnasRes] = await Promise.all([
      supabase
        .from("inscripciones")
        .select("*, alumna:alumnas(id, nombre, apellido)")
        .order("created_at", { ascending: false }),
      supabase.from("alumnas").select("*").order("nombre"),
    ]);
    if (inscRes.data) setInscripciones(inscRes.data);
    if (alumnasRes.data) setAlumnas(alumnasRes.data);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyInscripcion);
    setShowModal(true);
  }

  function openEdit(insc: Inscripcion) {
    setEditing(insc);
    setForm({
      alumna_id: insc.alumna_id,
      clase: insc.clase,
      dia_semana: insc.dia_semana,
      horario: insc.horario,
      estado: insc.estado,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      alumna_id: form.alumna_id,
      clase: form.clase,
      dia_semana: form.dia_semana,
      horario: form.horario,
      estado: form.estado,
    };

    if (editing) {
      await supabase.from("inscripciones").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("inscripciones").insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Segura que quieres eliminar esta inscripción?")) return;
    await supabase.from("inscripciones").delete().eq("id", id);
    fetchData();
  }

  const filtered = inscripciones.filter((i) => {
    const matchEstado = filterEstado === "todos" || i.estado === filterEstado;
    const matchAlumna = filterAlumna === "todas" || i.alumna_id === filterAlumna;
    return matchEstado && matchAlumna;
  });

  const estadoColors: Record<string, string> = {
    activa: "bg-green-100 text-green-700",
    pausada: "bg-yellow-100 text-yellow-700",
    cancelada: "bg-red-100 text-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Inscripciones</h1>
          <p className="text-gray-600">Gestiona las inscripciones de tus alumnas</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
        >
          + Nueva Inscripción
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select
          value={filterAlumna}
          onChange={(e) => setFilterAlumna(e.target.value)}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          <option value="todas">Todas las alumnas</option>
          {alumnas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} {a.apellido}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 border border-bg-warm text-center text-gray-500">
          Cargando inscripciones...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-bg-warm text-center text-gray-500">
          No se encontraron inscripciones
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-bg-warm overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-warm bg-bg">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Alumna</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Clase</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Día</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Horario</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((insc) => (
                <tr key={insc.id} className="border-b border-bg-warm last:border-0 hover:bg-bg">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {insc.alumna ? `${insc.alumna.nombre} ${insc.alumna.apellido}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{insc.clase}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{insc.dia_semana}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{insc.horario}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${estadoColors[insc.estado] || ""}`}>
                      {insc.estado.charAt(0).toUpperCase() + insc.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(insc)} className="text-accent hover:underline text-sm mr-3">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(insc.id)} className="text-red-500 hover:underline text-sm">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500">{filtered.length} inscripción{filtered.length !== 1 ? "es" : ""}</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-bg-warm">
              <h2 className="text-xl font-serif text-accent">
                {editing ? "Editar Inscripción" : "Nueva Inscripción"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alumna *</label>
                <select
                  value={form.alumna_id}
                  onChange={(e) => setForm({ ...form, alumna_id: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                >
                  <option value="">Seleccionar alumna...</option>
                  {alumnas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clase *</label>
                <select
                  value={form.clase}
                  onChange={(e) => setForm({ ...form, clase: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                >
                  {clases.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana *</label>
                  <select
                    value={form.dia_semana}
                    onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                  >
                    {diasSemana.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario *</label>
                  <input
                    type="time"
                    value={form.horario}
                    onChange={(e) => setForm({ ...form, horario: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value as Inscripcion["estado"] })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                >
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-bg-warm flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-bg-warm rounded text-gray-600 hover:bg-bg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.alumna_id || !form.clase || !form.dia_semana || !form.horario}
                className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50"
              >
                {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Inscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
