import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <h1 className="text-4xl font-serif mb-4 text-accent">
          Majo Villafaina — Feldenkrais
        </h1>
        <p className="text-gray-600 mb-8">Panel de Administración</p>
        <Link
          href="/admin"
          className="inline-block px-6 py-3 bg-accent text-white rounded hover:bg-accent-dark"
        >
          Ir al Panel
        </Link>
      </div>
    </div>
  );
}
