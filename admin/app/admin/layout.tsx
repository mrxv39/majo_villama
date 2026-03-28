"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/admin", label: "Panel", icon: "📊" },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: "📝" },
  { href: "/admin/alumnas", label: "Alumnas", icon: "👥" },
  { href: "/admin/pagos", label: "Pagos", icon: "💳" },
  { href: "/admin/clases", label: "Clases", icon: "🗓️" },
  { href: "/admin/asistencia", label: "Asistencia", icon: "✅" },
  { href: "/admin/contenido", label: "Contenido", icon: "📄" },
  { href: "/admin/reportes", label: "Reportes", icon: "����" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 w-64 h-full bg-white border-r border-bg-warm transition-transform duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-bg-warm">
            <h2 className="text-xl font-serif text-accent">
              Majo Villafaina
            </h2>
            <p className="text-xs text-gray-500 mt-1">Feldenkrais</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded transition ${
                        isActive
                          ? "bg-accent text-white"
                          : "text-gray-700 hover:bg-bg-warm"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-bg-warm">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark transition"
            >
              Cerrar Sesión
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-bg-warm p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-accent hover:bg-bg-warm rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-serif text-accent flex-1 md:flex-none">
            Panel de Control
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
