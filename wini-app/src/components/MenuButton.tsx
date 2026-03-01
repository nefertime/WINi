"use client";

type MenuButtonProps = {
  onClick: () => void;
  isOpen: boolean;
};

export default function MenuButton({ onClick, isOpen }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-[52] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        top: "max(1rem, env(safe-area-inset-top, 1rem))",
        left: "max(1rem, env(safe-area-inset-left, 1rem))",
        width: "clamp(2.75rem, 8vw, 4rem)",
        height: "clamp(2.75rem, 8vw, 4rem)",
        background: "#1A1A1A",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {/* Default avatar icon — user silhouette */}
      <svg
        style={{ width: "clamp(18px, 3.5vw, 28px)", height: "clamp(18px, 3.5vw, 28px)" }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAF6F0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
  );
}
