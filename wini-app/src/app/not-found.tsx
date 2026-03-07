import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--charcoal)", color: "var(--cream-lightest)" }}
    >
      <h1
        className="text-6xl mb-4"
        style={{ fontFamily: "var(--font-cinzel-family)", fontWeight: 700, color: "var(--burgundy-light)" }}
      >
        404
      </h1>
      <p
        className="text-xl mb-8"
        style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 400, color: "rgba(250, 246, 240, 0.7)" }}
      >
        This page has been uncorked and emptied.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
        style={{
          fontFamily: "var(--font-jost-family)",
          background: "var(--gold)",
          color: "var(--charcoal)",
          textDecoration: "none",
        }}
      >
        Return to WINi
      </Link>
    </main>
  );
}
