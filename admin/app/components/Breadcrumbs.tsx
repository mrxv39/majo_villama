"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labelMap: Record<string, string> = {
  admin: "Panel",
  alumnas: "Alumnas",
  pagos: "Pagos",
  inscripciones: "Inscripciones",
  clases: "Clases",
  asistencia: "Asistencia",
  contenido: "Contenido",
  reportes: "Reportes",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = labelMap[seg] || decodeURIComponent(seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
      <ol className="flex items-center gap-1">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">/</span>}
            {c.isLast ? (
              <span className="text-gray-700 font-medium">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-accent transition">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
