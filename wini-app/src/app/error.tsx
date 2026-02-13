"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ background: "var(--charcoal, #0D0D0D)" }}
    >
      <h2
        className="text-2xl mb-3"
        style={{
          fontFamily: "var(--font-cormorant-family)",
          color: "var(--cream-lightest, #FAF6F0)",
          fontWeight: 500,
        }}
      >
        Something went wrong
      </h2>
      <p
        className="text-sm mb-6 max-w-md"
        style={{
          fontFamily: "var(--font-jost-family)",
          color: "rgba(250, 246, 240, 0.5)",
        }}
      >
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full text-sm transition-all duration-200 hover:opacity-90 cursor-pointer"
        style={{
          background: "var(--gold, #C9A84C)",
          color: "var(--charcoal, #0D0D0D)",
          fontFamily: "var(--font-jost-family)",
          fontWeight: 500,
          border: "none",
        }}
      >
        Try again
      </button>
    </div>
  );
}
