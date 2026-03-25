"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(" ")[0] || "Majo";

  const stats = [
    {
      title: "Inscripciones Nuevas",
      value: "12",
      icon: "📝",
      color: "bg-blue-50",
    },
    {
      title: "Alumnas Activas",
      value: "28",
      icon: "👥",
      color: "bg-green-50",
    },
    {
      title: "Pagos Pendientes",
      value: "3",
      icon: "💳",
      color: "bg-orange-50",
    },
    {
      title: "Clases Este Mes",
      value: "16",
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
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-serif text-accent">
                    {stat.value}
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
            <a
              key={index}
              href={action.href}
              className="bg-white border-2 border-bg-warm rounded-lg p-6 hover:border-accent transition hover:shadow-md"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <p className="font-medium text-gray-700">{action.label}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-serif text-accent mb-4">
          Actividad Reciente
        </h2>
        <div className="bg-white rounded-lg p-6 border border-bg-warm">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-bg-warm last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-bg-warm flex items-center justify-center">
                📝
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Nueva inscripción recibida
                </p>
                <p className="text-sm text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-bg-warm last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-bg-warm flex items-center justify-center">
                💳
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">Pago procesado</p>
                <p className="text-sm text-gray-500">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-bg-warm last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-bg-warm flex items-center justify-center">
                👥
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Alumna confirmó asistencia
                </p>
                <p className="text-sm text-gray-500">Hace 1 día</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
