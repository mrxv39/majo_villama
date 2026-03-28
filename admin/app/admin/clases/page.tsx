"use client";

import { useEffect, useState } from "react";
import { Clase } from "@/lib/types";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import StatusBadge from "@/app/components/StatusBadge";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import FormField from "@/app/components/FormField";
import DataTable, { Column } from "@/app/components/DataTable";
import { useToast } from "@/app/components/Toast";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const emptyClase = {
  nombre: "",
  descripcion: "",
  dia_semana: diasSemana[0],
  hora_inicio: "10:00",
  hora_fin: "11:00",
  capacidad: "10",
  activa: true,
};

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Clase | null>(null);
  const [form, setForm] = useState(emptyClase);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClases();
  }, []);

  async function fetchClases() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clases");
      if (!res.ok) throw new Error("Error al cargar clases");
      setClases(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm(emptyClase);
    setShowModal(true);
  }

  function openEdit(c: Clase) {
    setEditing(c);
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion || "",
      dia_semana: c.dia_semana,
      hora_inicio: c.hora_inicio,
      hora_fin: c.hora_fin,
      capacidad: String(c.capacidad),
      activa: c.activa,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      capacidad: parseInt(form.capacidad) || 10,
      activa: form.activa,
    };

    try {
      const url = editing ? `/api/admin/clases/${editing.id}` : "/api/admin/clases";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      setShowModal(false);
      toast(editing ? "Clase actualizada" : "Clase creada", "success");
      fetchClases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/clases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast("Clase eliminada", "success");
      fetchClases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  const columns: Column<Clase>[] = [
    {
      key: "nombre",
      header: "Clase",
      render: (c) => (
        <>
          <div className="font-medium text-gray-800">{c.nombre}</div>
          {c.descripcion && <div className="text-xs text-gray-500 mt-0.5">{c.descripcion}</div>}
        </>
      ),
    },
    {
      key: "dia",
      header: "Día",
      render: (c) => <span className="text-gray-700">{c.dia_semana}</span>,
    },
    {
      key: "horario",
      header: "Horario",
      className: "hidden sm:table-cell",
      render: (c) => <span className="text-gray-600">{c.hora_inicio} - {c.hora_fin}</span>,
    },
    {
      key: "capacidad",
      header: "Capacidad",
      className: "hidden md:table-cell",
      render: (c) => (
        <span className={`text-sm ${(c.inscritas ?? 0) >= c.capacidad ? "text-red-500 font-medium" : "text-gray-600"}`}>
          {c.inscritas ?? 0}/{c.capacidad}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (c) => <StatusBadge status={c.activa ? "Activa" : "Inactiva"} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-right",
      render: (c) => (
        <div className="text-right">
          <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-accent hover:underline text-sm mr-3">
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c.id); }} className="text-red-500 hover:underline text-sm">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Clases</h1>
          <p className="text-gray-600">Gestiona horarios y clases</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
        >
          + Nueva Clase
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando clases..." />
      ) : clases.length === 0 ? (
        <EmptyState message="No hay clases configuradas" icon="🗓️" />
      ) : (
        <DataTable columns={columns} data={clases} keyExtractor={(c) => c.id} />
      )}

      <p className="text-sm text-gray-500">{clases.length} clase{clases.length !== 1 ? "s" : ""}</p>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Clase" : "Nueva Clase"}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-bg-warm rounded text-gray-600 hover:bg-bg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.nombre.trim() || !form.dia_semana}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner inline />}
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Clase"}
            </button>
          </>
        }
      >
        <FormField label="Nombre" htmlFor="clase_nombre" required>
          <input
            id="clase_nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
            placeholder="Ej: Feldenkrais Grupal"
          />
        </FormField>
        <FormField label="Descripción" htmlFor="clase_desc">
          <textarea
            id="clase_desc"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-bg-warm rounded resize-none"
          />
        </FormField>
        <FormField label="Día de la semana" htmlFor="clase_dia" required>
          <select
            id="clase_dia"
            value={form.dia_semana}
            onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          >
            {diasSemana.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Hora inicio" htmlFor="hora_inicio" required>
            <input
              id="hora_inicio"
              type="time"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
          <FormField label="Hora fin" htmlFor="hora_fin" required>
            <input
              id="hora_fin"
              type="time"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
          <FormField label="Capacidad" htmlFor="capacidad">
            <input
              id="capacidad"
              type="number"
              min="1"
              value={form.capacidad}
              onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-gray-700">Clase activa</span>
        </label>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Eliminar clase"
        message="¿Segura que quieres eliminar esta clase?"
      />
    </div>
  );
}
