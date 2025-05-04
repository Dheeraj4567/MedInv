export default function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="relative">
        <div className="loading-spinner" />
        <div className="absolute inset-0 animate-pulse">
          <div className="loading-pulse" />
        </div>
        <div className="absolute inset-0">
          <div className="loading-bar" />
        </div>
      </div>
    </div>
  )
}

