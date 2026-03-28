"use client";

import { useEffect, useState } from "react";
import { Inscripcion, Alumna } from "@/lib/types";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import StatusBadge from "@/app/components/StatusBadge";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SearchFilter from "@/app/components/SearchFilter";
import FormField from "@/app/components/FormField";
import DataTable, { Column } from "@/app/components/DataTable";
import { useToast } from "@/app/components/Toast";

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
  estado: "activa" as Inscripcion["estado"],
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
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inscripciones");
      if (!res.ok) throw new Error("Error al cargar inscripciones");
      const data = await res.json();
      setInscripciones(data.inscripciones);
      setAlumnas(data.alumnas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
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
    setError(null);
    const payload = {
      alumna_id: form.alumna_id,
      clase: form.clase,
      dia_semana: form.dia_semana,
      horario: form.horario,
      estado: form.estado,
    };

    try {
      const url = editing ? `/api/admin/inscripciones/${editing.id}` : "/api/admin/inscripciones";
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
      toast(editing ? "Inscripción actualizada" : "Inscripción creada", "success");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/inscripciones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast("Inscripción eliminada", "success");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  const filtered = inscripciones.filter((i) => {
    const matchEstado = filterEstado === "todos" || i.estado === filterEstado;
    const matchAlumna = filterAlumna === "todas" || i.alumna_id === filterAlumna;
    return matchEstado && matchAlumna;
  });

  const columns: Column<Inscripcion>[] = [
    {
      key: "alumna",
      header: "Alumna",
      render: (i) => (
        <span className="font-medium text-gray-800">
          {i.alumna ? `${i.alumna.nombre} ${i.alumna.apellido}` : "\u2014"}
        </span>
      ),
    },
    {
      key: "clase",
      header: "Clase",
      render: (i) => <span className="text-gray-700">{i.clase}</span>,
    },
    {
      key: "dia",
      header: "Día",
      className: "hidden sm:table-cell",
      render: (i) => <span className="text-gray-600">{i.dia_semana}</span>,
    },
    {
      key: "horario",
      header: "Horario",
      className: "hidden md:table-cell",
      render: (i) => <span className="text-gray-600">{i.horario}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (i) => <StatusBadge status={i.estado} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-right",
      render: (i) => (
        <div className="text-right">
          <button onClick={(e) => { e.stopPropagation(); openEdit(i); }} className="text-accent hover:underline text-sm mr-3">
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(i.id); }} className="text-red-500 hover:underline text-sm">
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <SearchFilter
        filters={[
          {
            value: filterEstado,
            onChange: setFilterEstado,
            options: [
              { value: "todos", label: "Todos los estados" },
              { value: "activa", label: "Activa" },
              { value: "pausada", label: "Pausada" },
              { value: "cancelada", label: "Cancelada" },
            ],
          },
          {
            value: filterAlumna,
            onChange: setFilterAlumna,
            options: [
              { value: "todas", label: "Todas las alumnas" },
              ...alumnas.map((a) => ({ value: a.id, label: `${a.nombre} ${a.apellido}` })),
            ],
          },
        ]}
      />

      {loading ? (
        <LoadingSpinner message="Cargando inscripciones..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No se encontraron inscripciones" icon="📝" />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(i) => i.id} />
      )}

      <p className="text-sm text-gray-500">{filtered.length} inscripción{filtered.length !== 1 ? "es" : ""}</p>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Inscripción" : "Nueva Inscripción"}
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
              disabled={saving || !form.alumna_id || !form.clase || !form.dia_semana || !form.horario}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner inline />}
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Inscripción"}
            </button>
          </>
        }
      >
        <FormField label="Alumna" htmlFor="insc_alumna_id" required>
          <select
            id="insc_alumna_id"
            value={form.alumna_id}
            onChange={(e) => setForm({ ...form, alumna_id: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          >
            <option value="">Seleccionar alumna...</option>
            {alumnas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Clase" htmlFor="clase" required>
          <select
            id="clase"
            value={form.clase}
            onChange={(e) => setForm({ ...form, clase: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          >
            {clases.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Día de la semana" htmlFor="dia_semana" required>
            <select
              id="dia_semana"
              value={form.dia_semana}
              onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            >
              {diasSemana.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Horario" htmlFor="horario" required>
            <input
              id="horario"
              type="time"
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
        </div>
        <FormField label="Estado" htmlFor="insc_estado">
          <select
            id="insc_estado"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as Inscripcion["estado"] })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          >
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </FormField>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Eliminar inscripción"
        message="¿Segura que quieres eliminar esta inscripción?"
      />
    </div>
  );
}
