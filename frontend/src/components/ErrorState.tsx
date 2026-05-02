export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-card error">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="ghost" onClick={onRetry}>
          Tekrar Dene
        </button>
      ) : null}
    </div>
  );
}
