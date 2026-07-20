import React from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="relative flex justify-center items-center bg-background px-4 min-h-screen overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Floating decorative elements */}
      <div className="top-20 left-20 absolute bg-primary/5 blur-3xl rounded-full w-64 h-64 animate-float pointer-events-none" />
      <div
        className="right-20 bottom-20 absolute bg-info/5 blur-3xl rounded-full w-80 h-80 animate-float pointer-events-none"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="top-1/2 left-1/3 absolute bg-warning/5 blur-3xl rounded-full w-48 h-48 animate-float pointer-events-none"
        style={{ animationDelay: "-4s" }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none noise-overlay" />

      <div className="z-10 relative w-full max-w-md">
        {/* Brand Section - Enhanced */}
        <div className="mb-10 text-center">
          <div className="inline-flex relative justify-center items-center mb-6">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />

            <div className="relative flex justify-center items-center bg-gradient-to-br from-primary to-emerald-600 shadow-elevated shadow-primary/30 border border-white/20 rounded-xl w-16 h-16 font-black text-white text-2xl">
              CR
            </div>
          </div>

          <h1 className="font-bold text-foreground text-3xl tracking-tight">
            Orbit
          </h1>
          <p className="mt-2 font-medium text-muted-foreground text-sm">
            Premium CRM for modern business growth
          </p>
        </div>

        {/* Card - Glass morphism effect */}
        <div className="relative bg-card/80 shadow-elevated backdrop-blur-xl p-8 border border-border/50 rounded-xl overflow-hidden">
          {/* Subtle gradient border */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, transparent 50%, var(--info) 100%)",
              opacity: "0.1",
              padding: "1px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            }}
          />

          {/* Shimmer effect on top */}
          <div className="top-0 right-0 left-0 absolute h-px shimmer" />

          <div className="z-10 relative">
            <div className="mb-8 text-center">
              <h2 className="font-bold text-foreground text-2xl tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
            </div>

            {children}

            <p className="mt-8 pt-6 border-border/50 border-t text-muted-foreground text-sm text-center">
              {footerText}{" "}
              <a
                href={footerLink}
                className="font-semibold text-primary hover:underline transition-all"
              >
                {footerLinkText}
              </a>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex justify-center items-center gap-2 mt-6 text-muted-foreground text-xs">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
}












