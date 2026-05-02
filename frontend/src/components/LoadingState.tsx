export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="state-card">
      <div className="spinner" aria-hidden="true" />
      <p>{label ?? 'Veriler yükleniyor...'}</p>
    </div>
  );
}
