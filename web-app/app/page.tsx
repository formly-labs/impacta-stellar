import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4">
      <main className="flex max-w-md flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Bienvenido a <span className="text-blue-500">Formly</span>
        </h1>
        <p className="text-slate-400">
          Crea y responde formularios con incentivos en Stellar. Conecta tu wallet para empezar.
        </p>
        <Link
          href="/connect"
          className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-colors hover:bg-blue-500"
        >
          Entrar a Formly
        </Link>
      </main>
    </div>
  );
}
