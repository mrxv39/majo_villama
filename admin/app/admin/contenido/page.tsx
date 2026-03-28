"use client";

import { useEffect, useState } from "react";
import { Contenido } from "@/lib/types";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import FormField from "@/app/components/FormField";
import { useToast } from "@/app/components/Toast";

const tipos = [
  { value: "ejercicio", label: "Ejercicio", icon: "🏃" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "documento", label: "Documento", icon: "📄" },
  { value: "enlace", label: "Enlace", icon: "🔗" },
];

const emptyContenido = {
  titulo: "",
  tipo: "ejercicio" as Contenido["tipo"],
  descripcion: "",
  url: "",
  contenido_texto: "",
  visible: true,
  orden: 0,
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function ContenidoPage() {
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contenido | null>(null);
  const [form, setForm] = useState(emptyContenido);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContenidos();
  }, []);

  async function fetchContenidos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contenido");
      if (!res.ok) throw new Error("Error al cargar contenido");
      setContenidos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm(emptyContenido);
    setShowModal(true);
  }

  function openEdit(c: Contenido) {
    setEditing(c);
    setForm({
      titulo: c.titulo,
      tipo: c.tipo,
      descripcion: c.descripcion || "",
      url: c.url || "",
      contenido_texto: c.contenido_texto || "",
      visible: c.visible,
      orden: c.orden,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const payload = { ...form, titulo: form.titulo.trim(), descripcion: form.descripcion.trim() };

    try {
      const url = editing ? `/api/admin/contenido/${editing.id}` : "/api/admin/contenido";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al guardar");
      setShowModal(false);
      toast(editing ? "Contenido actualizado" : "Contenido creado", "success");
      fetchContenidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/contenido/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast("Contenido eliminado", "success");
      fetchContenidos();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error", "error");
    }
  }

  async function toggleVisibility(c: Contenido) {
    try {
      await fetch(`/api/admin/contenido/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !c.visible }),
      });
      toast(c.visible ? "Contenido ocultado" : "Contenido visible", "info");
      fetchContenidos();
    } catch {
      toast("Error al cambiar visibilidad", "error");
    }
  }

  async function moveItem(c: Contenido, direction: "up" | "down") {
    const idx = contenidos.findIndex((x) => x.id === c.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= contenidos.length) return;

    const other = contenidos[swapIdx];
    await Promise.all([
      fetch(`/api/admin/contenido/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: other.orden }),
      }),
      fetch(`/api/admin/contenido/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: c.orden }),
      }),
    ]);
    fetchContenidos();
  }

  const tipoIcon = (tipo: string) => tipos.find((t) => t.value === tipo)?.icon || "📄";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Contenido</h1>
          <p className="text-gray-600">Gestiona el contenido de tu sitio web</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium"
        >
          + Nuevo Contenido
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando contenido..." />
      ) : contenidos.length === 0 ? (
        <EmptyState message="No hay contenido creado" icon="📄" />
      ) : (
        <div className="space-y-3">
          {contenidos.map((c, idx) => (
            <div key={c.id} className={`bg-white rounded-lg border border-bg-warm p-4 ${!c.visible ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-1">{tipoIcon(c.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">{c.titulo}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{c.tipo}</span>
                    {!c.visible && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Oculto</span>}
                  </div>
                  {c.descripcion && <p className="text-sm text-gray-500 mt-1">{c.descripcion}</p>}
                  {c.tipo === "video" && c.url && getYouTubeId(c.url) && (
                    <div className="mt-3 aspect-video max-w-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(c.url)}`}
                        className="w-full h-full rounded"
                        allowFullScreen
                        title={c.titulo}
                      />
                    </div>
                  )}
                  {c.tipo === "enlace" && c.url && (
                    <p className="text-sm text-accent mt-1 truncate">{c.url}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(c, "up")}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Subir"
                  >
                    &uarr;
                  </button>
                  <button
                    onClick={() => moveItem(c, "down")}
                    disabled={idx === contenidos.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Bajar"
                  >
                    &darr;
                  </button>
                  <button
                    onClick={() => toggleVisibility(c)}
                    className="p-1 text-gray-400 hover:text-gray-600 text-sm"
                    title={c.visible ? "Ocultar" : "Mostrar"}
                  >
                    {c.visible ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <button onClick={() => openEdit(c)} className="text-accent hover:underline text-sm ml-2">
                    Editar
                  </button>
                  <button onClick={() => setDeleteTarget(c.id)} className="text-red-500 hover:underline text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Contenido" : "Nuevo Contenido"}
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
              disabled={saving || !form.titulo.trim()}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner inline />}
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Contenido"}
            </button>
          </>
        }
      >
        <FormField label="Título" htmlFor="cont_titulo" required>
          <input
            id="cont_titulo"
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          />
        </FormField>
        <FormField label="Tipo" htmlFor="cont_tipo">
          <select
            id="cont_tipo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as Contenido["tipo"] })}
            className="w-full px-3 py-2 border border-bg-warm rounded"
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Descripción" htmlFor="cont_desc">
          <textarea
            id="cont_desc"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-bg-warm rounded resize-none"
          />
        </FormField>
        {(form.tipo === "video" || form.tipo === "documento" || form.tipo === "enlace") && (
          <FormField label="URL" htmlFor="cont_url">
            <input
              id="cont_url"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-3 py-2 border border-bg-warm rounded"
              placeholder={form.tipo === "video" ? "https://youtube.com/watch?v=..." : "https://..."}
            />
          </FormField>
        )}
        {form.tipo === "ejercicio" && (
          <FormField label="Contenido" htmlFor="cont_texto">
            <textarea
              id="cont_texto"
              value={form.contenido_texto}
              onChange={(e) => setForm({ ...form, contenido_texto: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-bg-warm rounded resize-none"
              placeholder="Describe el ejercicio..."
            />
          </FormField>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-gray-700">Visible</span>
        </label>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Eliminar contenido"
        message="¿Segura que quieres eliminar este contenido?"
      />
    </div>
  );
}
