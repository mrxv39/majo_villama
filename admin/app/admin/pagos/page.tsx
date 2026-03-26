"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pago, Alumna } from "@/lib/types";

const emptyPago = {
  alumna_id: "",
  monto: "",
  fecha_pago: new Date().toISOString().split("T")[0],
  metodo_pago: "efectivo",
  concepto: "",
  estado: "pagado" as const,
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [alumnas, setAlumnas] = useState<Alumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pago | null>(null);
  const [form, setForm] = useState(emptyPago);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterAlumna, setFilterAlumna] = useState("todas");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [pagosRes, alumnasRes] = await Promise.all([
      supabase
        .from("pagos")
        .select("*, alumna:alumnas(id, nombre, apellido)")
        .order("fecha_pago", { ascending: false }),
      supabase.from("alumnas").select("*").order("nombre"),
    ]);
    if (pagosRes.data) setPagos(pagosRes.data);
    if (alumnasRes.data) setAlumnas(alumnasRes.data);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyPago);
    setShowModal(true);
  }

  function openEdit(pago: Pago) {
    setEditing(pago);
    setForm({
      alumna_id: pago.alumna_id,
      monto: String(pago.monto),
      fecha_pago: pago.fecha_pago,
      metodo_pago: pago.metodo_pago,
      concepto: pago.concepto || "",
      estado: pago.estado,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      alumna_id: form.alumna_id,
      monto: parseFloat(form.monto),
      fecha_pago: form.fecha_pago,
      metodo_pago: form.metodo_pago,
      concepto: form.concepto.trim(),
      estado: form.estado,
    };

    if (editing) {
      await supabase.from("pagos").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("pagos").insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Segura que quieres eliminar este pago?")) return;
    await supabase.from("pagos").delete().eq("id", id);
    fetchData();
  }

  const filtered = pagos.filter((p) => {
    const matchEstado = filterEstado === "todos" || p.estado === filterEstado;
    const matchAlumna = filterAlumna === "todas" || p.alumna_id === filterAlumna;
    return matchEstado && matchAlumna;
  });

  const estadoColors: Record<string, string> = {
    pagado: "bg-green-100 text-green-700",
    pendiente: "bg-orange-100 text-orange-700",
    cancelado: "bg-red-100 text-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Pagos</h1>
          <p className="text-gray-600">Gestiona los pagos de las alumnas</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
        >
          + Registrar Pago
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
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="cancelado">Cancelado</option>
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
          Cargando pagos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-bg-warm text-center text-gray-500">
          No se encontraron pagos
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-bg-warm overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-warm bg-bg">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Alumna</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Monto</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Fecha</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Método</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pago) => (
                <tr key={pago.id} className="border-b border-bg-warm last:border-0 hover:bg-bg">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {pago.alumna ? `${pago.alumna.nombre} ${pago.alumna.apellido}` : "—"}
                    </div>
                    {pago.concepto && (
                      <div className="text-xs text-gray-500 mt-0.5">{pago.concepto}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{pago.monto.toFixed(2)} &euro;</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {new Date(pago.fecha_pago).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell capitalize">{pago.metodo_pago}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${estadoColors[pago.estado] || ""}`}>
                      {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(pago)} className="text-accent hover:underline text-sm mr-3">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(pago.id)} className="text-red-500 hover:underline text-sm">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500">{filtered.length} pago{filtered.length !== 1 ? "s" : ""}</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-bg-warm">
              <h2 className="text-xl font-serif text-accent">
                {editing ? "Editar Pago" : "Registrar Pago"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={form.fecha_pago}
                    onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                  <select
                    value={form.metodo_pago}
                    onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="bizum">Bizum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as Pago["estado"] })}
                    className="w-full px-3 py-2 border border-bg-warm rounded"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input
                  type="text"
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="w-full px-3 py-2 border border-bg-warm rounded"
                  placeholder="Ej: Mensualidad marzo"
                />
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
                disabled={saving || !form.alumna_id || !form.monto || !form.fecha_pago}
                className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50"
              >
                {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Registrar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
