"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  inscripcionesNuevas: number;
  alumnasActivas: number;
  pagosPendientes: number;
  clasesEsteMes: number;
}

interface ActivityItem {
  id: string;
  type: "pago" | "inscripcion";
  description: string;
  date: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    inscripcionesNuevas: 0,
    alumnasActivas: 0,
    pagosPendientes: 0,
    clasesEsteMes: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.name?.split(" ")[0] || "Majo";

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    const [alumnasRes, inscMesRes, pagosPendRes, clasesRes, pagosRecientes, inscRecientes] =
      await Promise.all([
        supabase.from("alumnas").select("id", { count: "exact" }).eq("activa", true),
        supabase
          .from("inscripciones")
          .select("id", { count: "exact" })
          .gte("fecha_inscripcion", firstOfMonth),
        supabase.from("pagos").select("id", { count: "exact" }).eq("estado", "pendiente"),
        supabase
          .from("inscripciones")
          .select("clase", { count: "exact" })
          .eq("estado", "activa"),
        supabase
          .from("pagos")
          .select("id, monto, fecha_pago, estado, alumna:alumnas(nombre, apellido)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("inscripciones")
          .select("id, clase, fecha_inscripcion, alumna:alumnas(nombre, apellido)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    setStats({
      inscripcionesNuevas: inscMesRes.count ?? 0,
      alumnasActivas: alumnasRes.count ?? 0,
      pagosPendientes: pagosPendRes.count ?? 0,
      clasesEsteMes: clasesRes.count ?? 0,
    });

    // Merge and sort recent activity
    const items: ActivityItem[] = [];

    if (pagosRecientes.data) {
      for (const p of pagosRecientes.data) {
        const alumna = p.alumna as { nombre: string; apellido: string } | null;
        const nombre = alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna";
        items.push({
          id: `pago-${p.id}`,
          type: "pago",
          description: `Pago de ${nombre} — ${Number(p.monto).toFixed(2)} € (${p.estado})`,
          date: p.fecha_pago,
        });
      }
    }

    if (inscRecientes.data) {
      for (const i of inscRecientes.data) {
        const alumna = i.alumna as { nombre: string; apellido: string } | null;
        const nombre = alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna";
        items.push({
          id: `insc-${i.id}`,
          type: "inscripcion",
          description: `${nombre} inscrita en ${i.clase}`,
          date: i.fecha_inscripcion,
        });
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivity(items.slice(0, 5));
    setLoading(false);
  }

  const statCards = [
    {
      title: "Inscripciones Nuevas",
      value: stats.inscripcionesNuevas,
      icon: "📝",
      color: "bg-blue-50",
    },
    {
      title: "Alumnas Activas",
      value: stats.alumnasActivas,
      icon: "👥",
      color: "bg-green-50",
    },
    {
      title: "Pagos Pendientes",
      value: stats.pagosPendientes,
      icon: "💳",
      color: "bg-orange-50",
    },
    {
      title: "Clases Este Mes",
      value: stats.clasesEsteMes,
      icon: "📅",
      color: "bg-purple-50",
    },
  ];

  const actions = [
    { label: "Nueva Inscripción", href: "/admin/inscripciones", icon: "➕" },
    { label: "Ver Alumnas", href: "/admin/alumnas", icon: "👥" },
    { label: "Registrar Pago", href: "/admin/pagos", icon: "💰" },
    { label: "Agregar Contenido", href: "/admin/contenido", icon: "📝" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg p-8">
        <h1 className="text-3xl font-serif mb-2">¡Hola, {firstName}!</h1>
        <p className="text-accent-light opacity-90">
          Bienvenida al panel de administración de tu práctica de Feldenkrais
        </p>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-2xl font-serif text-accent mb-4">Estadísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-serif text-accent">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-serif text-accent mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white border-2 border-bg-warm rounded-lg p-6 hover:border-accent transition hover:shadow-md"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <p className="font-medium text-gray-700">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-serif text-accent mb-4">
          Actividad Reciente
        </h2>
        <div className="bg-white rounded-lg p-6 border border-bg-warm">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Cargando actividad...</p>
          ) : activity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b border-bg-warm last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 rounded-full bg-bg-warm flex items-center justify-center">
                    {item.type === "pago" ? "💳" : "📝"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
