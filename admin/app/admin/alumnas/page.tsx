"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alumna } from "@/lib/types";

const emptyAlumna = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  notas: "",
  activa: true,
};

export default function AlumnasPage() {
  const [alumnas, setAlumnas] = useState<Alumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Alumna | null>(null);
  const [form, setForm] = useState(emptyAlumna);
  const [search, setSearch] = useState("");
  const [filterActiva, setFilterActiva] = useState<string>("todas");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlumnas();
  }, []);

  async function fetchAlumnas() {
    setLoading(true);
    const { data, error } = await supabase
      .from("alumnas")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAlumnas(data);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyAlumna);
    setShowModal(true);
  }

  function openEdit(alumna: Alumna) {
    setEditing(alumna);
    setForm({
      nombre: alumna.nombre,
      apellido: alumna.apellido,
      email: alumna.email || "",
      telefono: alumna.telefono || "",
      fecha_nacimiento: alumna.fecha_nacimiento || "",
      notas: alumna.notas || "",
      activa: alumna.activa,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      notas: form.notas.trim(),
      activa: form.activa,
    };

    if (editing) {
      await supabase.from("alumnas").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("alumnas").insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchAlumnas();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Segura que quieres eliminar esta alumna? Se borrarán también sus pagos e inscripciones.")) return;
    await supabase.from("alumnas").delete().eq("id", id);
    fetchAlumnas();
  }

  const filtered = alumnas.filter((a) => {
    const matchSearch =
      `${a.nombre} ${a.apellido} ${a.email || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterActiva === "todas" ||
      (filterActiva === "activas" && a.activa) ||
      (filterActiva === "inactivas" && !a.activa);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Alumnas</h1>
          <p className="text-gray-600">Gestiona el registro de tus alumnas</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
        >
          + Nueva Alumna
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-bg-warm rounded bg-white"
        />
        <select
          value={filterActiva}
          onChange={(e) => setFilterActiva(e.target.value)}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          <option value="todas">Todas</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 border border-bg-warm text-center text-gray-500">
          Cargando alumnas...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-bg-warm text-center text-gray-500">
          No se encontraron alumnas
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-bg-warm overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-warm bg-bg">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Teléfono</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alumna) => (
                <tr key={alumna.id} className="border-b border-bg-warm last:border-0 hover:bg-bg">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{alumna.nombre} {alumna.apellido}</div>
                    {alumna.notas && (
                      <div className="text-xs text-gray-500 mt-0.5">{alumna.notas}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{alumna.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{alumna.telefono || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        alumna.activa
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {alumna.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(alumna)}
                      className="text-accent hover:underline text-sm mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(alumna.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500">{filtered.length} alumna{filtered.length !== 1 ? "s" : ""}</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-bg-warm">
              <h2 className="text-xl font-serif text-accent">
                {editing ? "Editar Alumna" : "Nueva Alumna"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-bg-warm rounded resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm text-gray-700">Alumna activa</span>
              </label>
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
                disabled={saving || !form.nombre.trim() || !form.apellido.trim()}
                className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50"
              >
                {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Alumna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
