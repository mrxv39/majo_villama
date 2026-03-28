"use client";

import { useEffect, useState } from "react";
import { Clase, Alumna, Asistencia } from "@/lib/types";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import EmptyState from "@/app/components/EmptyState";
import StatusBadge from "@/app/components/StatusBadge";
import { useToast } from "@/app/components/Toast";

export default function AsistenciaPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [alumnas, setAlumnas] = useState<Alumna[]>([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [claseId, setClaseId] = useState("");
  const [asistencias, setAsistencias] = useState<Record<string, boolean>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"registrar" | "historial">("registrar");
  const [historial, setHistorial] = useState<Asistencia[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [filterAlumna, setFilterAlumna] = useState("todas");
  const [filterClase, setFilterClase] = useState("todas");
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [clasesRes, alumnasRes] = await Promise.all([
          fetch("/api/admin/clases"),
          fetch("/api/admin/alumnas"),
        ]);
        const clasesData = await clasesRes.json();
        const alumnasData = await alumnasRes.json();
        setClases(clasesData.filter((c: Clase) => c.activa));
        setAlumnas(alumnasData.filter((a: Alumna) => a.activa));
      } catch {
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (claseId && fecha) loadExisting();
  }, [claseId, fecha]);

  async function loadExisting() {
    try {
      const res = await fetch(`/api/admin/asistencia?fecha=${fecha}&clase_id=${claseId}`);
      const data: Asistencia[] = await res.json();
      const map: Record<string, boolean> = {};
      const notasMap: Record<string, string> = {};
      for (const a of data) {
        map[a.alumna_id] = a.asistio;
        notasMap[a.alumna_id] = a.notas || "";
      }
      setAsistencias(map);
      setNotas(notasMap);
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    if (!claseId) return;
    setSaving(true);
    const records = alumnas.map((a) => ({
      alumna_id: a.id,
      clase_id: claseId,
      fecha,
      asistio: asistencias[a.id] ?? false,
      notas: notas[a.id] || "",
    }));

    try {
      const res = await fetch("/api/admin/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast("Asistencia guardada", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function loadHistorial() {
    setHistLoading(true);
    try {
      let url = "/api/admin/asistencia?";
      if (filterAlumna !== "todas") url += `alumna_id=${filterAlumna}&`;
      if (filterClase !== "todas") url += `clase_id=${filterClase}&`;
      const res = await fetch(url);
      setHistorial(await res.json());
    } catch {
      toast("Error al cargar historial", "error");
    } finally {
      setHistLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "historial") loadHistorial();
  }, [tab, filterAlumna, filterClase]);

  if (loading) return <LoadingSpinner message="Cargando..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-accent mb-1">Asistencia</h1>
        <p className="text-gray-600">Registra y consulta la asistencia de tus alumnas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-bg-warm">
        <button
          onClick={() => setTab("registrar")}
          className={`pb-2 px-1 text-sm font-medium transition border-b-2 ${
            tab === "registrar" ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Registrar Asistencia
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`pb-2 px-1 text-sm font-medium transition border-b-2 ${
            tab === "historial" ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Historial
        </button>
      </div>

      {tab === "registrar" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-4 py-2 border border-bg-warm rounded bg-white"
            />
            <select
              value={claseId}
              onChange={(e) => setClaseId(e.target.value)}
              className="px-4 py-2 border border-bg-warm rounded bg-white flex-1"
            >
              <option value="">Seleccionar clase...</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {c.dia_semana} {c.hora_inicio}-{c.hora_fin}
                </option>
              ))}
            </select>
          </div>

          {!claseId ? (
            <EmptyState message="Selecciona una clase para registrar asistencia" icon="✅" />
          ) : (
            <>
              <div className="bg-white rounded-lg border border-bg-warm">
                {alumnas.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 px-4 py-3 border-b border-bg-warm last:border-0">
                    <input
                      type="checkbox"
                      checked={asistencias[a.id] ?? false}
                      onChange={(e) => setAsistencias({ ...asistencias, [a.id]: e.target.checked })}
                      className="w-5 h-5 accent-accent"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{a.nombre} {a.apellido}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Notas..."
                      value={notas[a.id] || ""}
                      onChange={(e) => setNotas({ ...notas, [a.id]: e.target.value })}
                      className="px-2 py-1 text-sm border border-bg-warm rounded w-40 hidden sm:block"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <LoadingSpinner inline />}
                {saving ? "Guardando..." : "Guardar Asistencia"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterClase}
              onChange={(e) => setFilterClase(e.target.value)}
              className="px-4 py-2 border border-bg-warm rounded bg-white"
            >
              <option value="todas">Todas las clases</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.dia_semana}</option>
              ))}
            </select>
            <select
              value={filterAlumna}
              onChange={(e) => setFilterAlumna(e.target.value)}
              className="px-4 py-2 border border-bg-warm rounded bg-white"
            >
              <option value="todas">Todas las alumnas</option>
              {alumnas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
              ))}
            </select>
          </div>

          {histLoading ? (
            <LoadingSpinner message="Cargando historial..." />
          ) : historial.length === 0 ? (
            <EmptyState message="No hay registros de asistencia" icon="📋" />
          ) : (
            <div className="bg-white rounded-lg border border-bg-warm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-bg-warm bg-bg">
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Alumna</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Clase</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Asistió</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((a) => (
                    <tr key={a.id} className="border-b border-bg-warm last:border-0 hover:bg-bg">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(a.fecha).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {a.alumna ? `${a.alumna.nombre} ${a.alumna.apellido}` : "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {a.clase ? a.clase.nombre : "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.asistio ? "Activa" : "Cancelada"} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm hidden md:table-cell">{a.notas || "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
