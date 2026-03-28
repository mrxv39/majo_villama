"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import StatusBadge from "@/app/components/StatusBadge";
import { downloadCSV } from "@/lib/export";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Reporte {
  alumnasActivas: number;
  inscripcionesNuevas: number;
  inscripcionesCanceladas: number;
  totalCobrado: number;
  totalPendiente: number;
  porMetodo: Record<string, number>;
  pagosPendientes: Array<{
    id: string;
    monto: number;
    fecha_pago: string;
    concepto: string;
    alumna?: { nombre: string; apellido: string };
  }>;
}

export default function ReportesPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [data, setData] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, anio]);

  async function fetchReporte() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reportes?mes=${mes}&anio=${anio}`);
      setData(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function exportar() {
    if (!data) return;
    const rows = [
      { campo: "Alumnas activas", valor: String(data.alumnasActivas) },
      { campo: "Inscripciones nuevas", valor: String(data.inscripcionesNuevas) },
      { campo: "Inscripciones canceladas", valor: String(data.inscripcionesCanceladas) },
      { campo: "Total cobrado", valor: data.totalCobrado.toFixed(2) },
      { campo: "Total pendiente", valor: data.totalPendiente.toFixed(2) },
      ...Object.entries(data.porMetodo).map(([k, v]) => ({
        campo: `Cobrado por ${k}`,
        valor: v.toFixed(2),
      })),
    ];
    downloadCSV(rows, `resumen_${anio}-${String(mes).padStart(2, "0")}.csv`, {
      campo: "Concepto",
      valor: "Valor",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-accent mb-1">Reportes</h1>
          <p className="text-gray-600">Resumen mensual de actividad</p>
        </div>
        <button
          onClick={exportar}
          disabled={!data}
          className="px-5 py-2.5 bg-accent text-white rounded hover:bg-accent-dark transition font-medium disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>

      {/* Selector de mes */}
      <div className="flex gap-3">
        <select
          value={mes}
          onChange={(e) => setMes(parseInt(e.target.value))}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          {meses.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={anio}
          onChange={(e) => setAnio(parseInt(e.target.value))}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Generando reporte..." />
      ) : data ? (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-5">
              <p className="text-sm text-gray-600">Alumnas activas</p>
              <p className="text-3xl font-serif text-accent">{data.alumnasActivas}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-5">
              <p className="text-sm text-gray-600">Inscripciones nuevas</p>
              <p className="text-3xl font-serif text-accent">{data.inscripcionesNuevas}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-5">
              <p className="text-sm text-gray-600">Inscripciones canceladas</p>
              <p className="text-3xl font-serif text-accent">{data.inscripcionesCanceladas}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-5">
              <p className="text-sm text-gray-600">Total cobrado</p>
              <p className="text-3xl font-serif text-accent">{data.totalCobrado.toFixed(2)} &euro;</p>
            </div>
          </div>

          {/* Desglose por método */}
          <div className="bg-white rounded-lg border border-bg-warm p-6">
            <h2 className="text-lg font-serif text-accent mb-4">Desglose por método de pago</h2>
            {Object.keys(data.porMetodo).length === 0 ? (
              <p className="text-gray-500 text-sm">Sin pagos este mes</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data.porMetodo).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="capitalize text-gray-700">{method}</span>
                    <span className="font-medium text-gray-800">{amount.toFixed(2)} &euro;</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-bg-warm flex items-center justify-between font-medium">
                  <span className="text-gray-700">Total</span>
                  <span className="text-accent">{data.totalCobrado.toFixed(2)} &euro;</span>
                </div>
              </div>
            )}
          </div>

          {/* Pendientes totales */}
          <div className="bg-white rounded-lg border border-bg-warm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-accent">Pagos pendientes</h2>
              <span className="font-medium text-orange-600">{data.totalPendiente.toFixed(2)} &euro;</span>
            </div>
            {data.pagosPendientes.length === 0 ? (
              <p className="text-gray-500 text-sm">Sin pagos pendientes</p>
            ) : (
              <div className="space-y-2">
                {data.pagosPendientes.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-bg-warm last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">
                        {p.alumna ? `${p.alumna.nombre} ${p.alumna.apellido}` : "\u2014"}
                      </span>
                      {p.concepto && <span className="text-sm text-gray-500 ml-2">{p.concepto}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">{Number(p.monto).toFixed(2)} &euro;</span>
                      <StatusBadge status="pendiente" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
