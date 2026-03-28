"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alumna, Pago, Inscripcion } from "@/lib/types";
import StatusBadge from "@/app/components/StatusBadge";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import DataTable, { Column } from "@/app/components/DataTable";
import Link from "next/link";

export default function AlumnaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [alumna, setAlumna] = useState<Alumna | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/alumnas/${id}`);
        if (!res.ok) throw new Error("Error al cargar datos");
        const data = await res.json();
        setAlumna(data.alumna);
        setPagos(data.pagos);
        setInscripciones(data.inscripciones);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Cargando datos de alumna..." />;
  if (error || !alumna)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || "Alumna no encontrada"}
      </div>
    );

  const totalPagado = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + Number(p.monto), 0);
  const pagosPendientes = pagos.filter((p) => p.estado === "pendiente");
  const totalPendiente = pagosPendientes.reduce((sum, p) => sum + Number(p.monto), 0);
  const inscActivas = inscripciones.filter((i) => i.estado === "activa");

  const pagoColumns: Column<Pago>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (p) => <span className="text-gray-600">{new Date(p.fecha_pago).toLocaleDateString("es-ES")}</span>,
    },
    {
      key: "concepto",
      header: "Concepto",
      render: (p) => <span className="text-gray-700">{p.concepto || "\u2014"}</span>,
    },
    {
      key: "monto",
      header: "Monto",
      render: (p) => <span className="font-medium text-gray-800">{Number(p.monto).toFixed(2)} &euro;</span>,
    },
    {
      key: "metodo",
      header: "Método",
      className: "hidden sm:table-cell",
      render: (p) => <span className="text-gray-600 capitalize">{p.metodo_pago}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => <StatusBadge status={p.estado} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-accent hover:underline text-sm">
          &larr; Volver
        </button>
        <Link
          href="/admin/alumnas"
          className="text-sm text-gray-500 hover:text-accent"
        >
          Ver todas las alumnas
        </Link>
      </div>

      {/* Alumna Info */}
      <div className="bg-white rounded-lg border border-bg-warm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif text-accent mb-1">
              {alumna.nombre} {alumna.apellido}
            </h1>
            <StatusBadge status={alumna.activa ? "Activa" : "Inactiva"} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>
            <p className="font-medium text-gray-700">{alumna.email || "\u2014"}</p>
          </div>
          <div>
            <span className="text-gray-500">Teléfono:</span>
            <p className="font-medium text-gray-700">{alumna.telefono || "\u2014"}</p>
          </div>
          <div>
            <span className="text-gray-500">Fecha de alta:</span>
            <p className="font-medium text-gray-700">
              {alumna.fecha_alta ? new Date(alumna.fecha_alta).toLocaleDateString("es-ES") : "\u2014"}
            </p>
          </div>
          {alumna.notas && (
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="text-gray-500">Notas:</span>
              <p className="font-medium text-gray-700">{alumna.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total pagado</p>
          <p className="text-2xl font-serif text-accent">{totalPagado.toFixed(2)} &euro;</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pendiente</p>
          <p className="text-2xl font-serif text-accent">{totalPendiente.toFixed(2)} &euro;</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Inscripciones activas</p>
          <p className="text-2xl font-serif text-accent">{inscActivas.length}</p>
        </div>
      </div>

      {/* Inscripciones activas */}
      {inscActivas.length > 0 && (
        <div>
          <h2 className="text-xl font-serif text-accent mb-3">Inscripciones activas</h2>
          <div className="bg-white rounded-lg border border-bg-warm divide-y divide-bg-warm">
            {inscActivas.map((i) => (
              <div key={i.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">{i.clase}</span>
                  <span className="text-gray-500 text-sm ml-2">{i.dia_semana} {i.horario}</span>
                </div>
                <StatusBadge status={i.estado} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-serif text-accent">Historial de pagos</h2>
          <Link
            href={`/admin/pagos`}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark transition text-sm"
          >
            Registrar Pago
          </Link>
        </div>
        {pagos.length === 0 ? (
          <div className="bg-white rounded-lg p-6 border border-bg-warm text-center text-gray-500">
            No hay pagos registrados
          </div>
        ) : (
          <DataTable columns={pagoColumns} data={pagos} keyExtractor={(p) => p.id} />
        )}
      </div>
    </div>
  );
}
