export function Loader() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      
      <p className="animate-pulse text-sm font-medium text-gray-400">
        Cargando...
      </p>
    </div>
  );
}
