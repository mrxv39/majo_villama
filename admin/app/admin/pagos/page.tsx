"use client";

import { useEffect, useState } from "react";
import { Pago, Alumna } from "@/lib/types";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import StatusBadge from "@/app/components/StatusBadge";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SearchFilter from "@/app/components/SearchFilter";
import FormField from "@/app/components/FormField";
import DataTable, { Column } from "@/app/components/DataTable";
import { useToast } from "@/app/components/Toast";

const emptyPago = {
  alumna_id: "",
  monto: "",
  fecha_pago: new Date().toISOString().split("T")[0],
  metodo_pago: "efectivo",
  concepto: "",
  estado: "pagado" as Pago["estado"],
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
      const [pagosRes, alumnasRes] = await Promise.all([
        fetch("/api/admin/pagos"),
        fetch("/api/admin/alumnas"),
      ]);
      if (!pagosRes.ok) throw new Error("Error al cargar pagos");
      if (!alumnasRes.ok) throw new Error("Error al cargar alumnas");
      setPagos(await pagosRes.json());
      setAlumnas(await alumnasRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
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
    setError(null);
    const payload = {
      alumna_id: form.alumna_id,
      monto: parseFloat(form.monto),
      fecha_pago: form.fecha_pago,
      metodo_pago: form.metodo_pago,
      concepto: form.concepto.trim(),
      estado: form.estado,
    };

    try {
      const url = editing ? `/api/admin/pagos/${editing.id}` : "/api/admin/pagos";
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
      toast(editing ? "Pago actualizado" : "Pago registrado", "success");
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
      const res = await fetch(`/api/admin/pagos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast("Pago eliminado", "success");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  const filtered = pagos.filter((p) => {
    const matchEstado = filterEstado === "todos" || p.estado === filterEstado;
    const matchAlumna = filterAlumna === "todas" || p.alumna_id === filterAlumna;
    return matchEstado && matchAlumna;
  });

  const columns: Column<Pago>[] = [
    {
      key: "alumna",
      header: "Alumna",
      render: (p) => (
        <>
          <div className="font-medium text-gray-800">
            {p.alumna ? `${p.alumna.nombre} ${p.alumna.apellido}` : "\u2014"}
          </div>
          {p.concepto && <div className="text-xs text-gray-500 mt-0.5">{p.concepto}</div>}
        </>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      render: (p) => <span className="font-medium text-gray-800">{Number(p.monto).toFixed(2)} &euro;</span>,
    },
    {
      key: "fecha",
      header: "Fecha",
      className: "hidden sm:table-cell",
      render: (p) => <span className="text-gray-600">{new Date(p.fecha_pago).toLocaleDateString("es-ES")}</span>,
    },
    {
      key: "metodo",
      header: "Método",
      className: "hidden md:table-cell",
      render: (p) => <span className="text-gray-600 capitalize">{p.metodo_pago}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => <StatusBadge status={p.estado} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-right",
      render: (p) => (
        <div className="text-right">
          <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="text-accent hover:underline text-sm mr-3">
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id); }} className="text-red-500 hover:underline text-sm">
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
              { value: "pagado", label: "Pagado" },
              { value: "pendiente", label: "Pendiente" },
              { value: "cancelado", label: "Cancelado" },
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
        <LoadingSpinner message="Cargando pagos..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No se encontraron pagos" icon="💳" />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} />
      )}

      <p className="text-sm text-gray-500">{filtered.length} pago{filtered.length !== 1 ? "s" : ""}</p>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Pago" : "Registrar Pago"}
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
              disabled={saving || !form.alumna_id || !form.monto || !form.fecha_pago}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner inline />}
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Registrar Pago"}
            </button>
          </>
        }
      >
        <FormField label="Alumna" htmlFor="alumna_id" required>
          <select
            id="alumna_id"
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Monto" htmlFor="monto" required>
            <input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Fecha" htmlFor="fecha_pago" required>
            <input
              id="fecha_pago"
              type="date"
              value={form.fecha_pago}
              onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Método de pago" htmlFor="metodo_pago">
            <select
              id="metodo_pago"
              value={form.metodo_pago}
              onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="bizum">Bizum</option>
            </select>
          </FormField>
          <FormField label="Estado" htmlFor="estado">
            <select
              id="estado"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as Pago["estado"] })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
            >
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </FormField>
        </div>
        <FormField label="Concepto" htmlFor="concepto">
          <input
            id="concepto"
            type="text"
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
            placeholder="Ej: Mensualidad marzo"
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Eliminar pago"
        message="¿Segura que quieres eliminar este pago?"
      />
    </div>
  );
}
