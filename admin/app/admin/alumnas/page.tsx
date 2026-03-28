"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alumna } from "@/lib/types";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import StatusBadge from "@/app/components/StatusBadge";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SearchFilter from "@/app/components/SearchFilter";
import FormField from "@/app/components/FormField";
import DataTable, { Column } from "@/app/components/DataTable";
import { useToast } from "@/app/components/Toast";
import { downloadCSV } from "@/lib/export";

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
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAlumnas();
  }, []);

  async function fetchAlumnas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/alumnas");
      if (!res.ok) throw new Error("Error al cargar alumnas");
      const data = await res.json();
      setAlumnas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
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
    setError(null);
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      notas: form.notas.trim(),
      activa: form.activa,
    };

    try {
      const url = editing ? `/api/admin/alumnas/${editing.id}` : "/api/admin/alumnas";
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
      toast(editing ? "Alumna actualizada" : "Alumna creada", "success");
      fetchAlumnas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/alumnas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast("Alumna eliminada", "success");
      fetchAlumnas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
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

  const columns: Column<Alumna>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (a) => (
        <>
          <div className="font-medium text-gray-800">{a.nombre} {a.apellido}</div>
          {a.notas && <div className="text-xs text-gray-500 mt-0.5">{a.notas}</div>}
        </>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "hidden md:table-cell",
      render: (a) => <span className="text-gray-600">{a.email || "\u2014"}</span>,
    },
    {
      key: "telefono",
      header: "Teléfono",
      className: "hidden sm:table-cell",
      render: (a) => <span className="text-gray-600">{a.telefono || "\u2014"}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => <StatusBadge status={a.activa ? "Activa" : "Inactiva"} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-right",
      render: (a) => (
        <div className="text-right">
          <button onClick={(e) => { e.stopPropagation(); openEdit(a); }} className="text-accent hover:underline text-sm mr-3">
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(a.id); }} className="text-red-500 hover:underline text-sm">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Alumnas</h1>
          <p className="text-gray-600">Gestiona el registro de tus alumnas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const date = new Date().toISOString().split("T")[0];
              downloadCSV(
                filtered.map((a) => ({
                  nombre: a.nombre,
                  apellido: a.apellido,
                  email: a.email || "",
                  telefono: a.telefono || "",
                  estado: a.activa ? "Activa" : "Inactiva",
                  notas: a.notas || "",
                })),
                `alumnas_${date}.csv`,
                { nombre: "Nombre", apellido: "Apellido", email: "Email", telefono: "Teléfono", estado: "Estado", notas: "Notas" }
              );
            }}
            className="px-4 py-2.5 border border-bg-warm rounded text-gray-600 hover:bg-bg transition font-medium"
          >
            Exportar CSV
          </button>
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
          >
            + Nueva Alumna
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        filters={[
          {
            value: filterActiva,
            onChange: setFilterActiva,
            options: [
              { value: "todas", label: "Todas" },
              { value: "activas", label: "Activas" },
              { value: "inactivas", label: "Inactivas" },
            ],
          },
        ]}
      />

      {loading ? (
        <LoadingSpinner message="Cargando alumnas..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No se encontraron alumnas" icon="👥" />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(a) => a.id} onRowClick={(a) => router.push(`/admin/alumnas/${a.id}`)} />
      )}

      <p className="text-sm text-gray-500">{filtered.length} alumna{filtered.length !== 1 ? "s" : ""}</p>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Alumna" : "Nueva Alumna"}
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
              disabled={saving || !form.nombre.trim() || !form.apellido.trim()}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner inline />}
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Alumna"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre" htmlFor="nombre" required>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
          <FormField label="Apellido" htmlFor="apellido" required>
            <input
              id="apellido"
              type="text"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          />
        </FormField>
        <FormField label="Teléfono" htmlFor="telefono">
          <input
            id="telefono"
            type="text"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          />
        </FormField>
        <FormField label="Fecha de nacimiento" htmlFor="fecha_nacimiento">
          <input
            id="fecha_nacimiento"
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          />
        </FormField>
        <FormField label="Notas" htmlFor="notas">
          <textarea
            id="notas"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-bg-warm rounded resize-none"
          />
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-gray-700">Alumna activa</span>
        </label>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Eliminar alumna"
        message="¿Segura que quieres eliminar esta alumna? Se borrarán también sus pagos e inscripciones."
      />
    </div>
  );
}
