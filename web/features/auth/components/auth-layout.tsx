"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ClixProLogo } from "@/shared/ui/logo";
import AuthFormTransition from "./auth-form-transition";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
};

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Lead Management",
    desc: "Organize and track your leads in one place",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    label: "Sales Pipeline",
    desc: "Track every deal from start to close",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    label: "Smart Reports",
    desc: "Get clear insights to grow your business",
  },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Full-Screen Animated Particle Constellation (continuous, uninterrupted) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    // Interactive mouse tracking
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Create particles tailored to screen size
    const particleCount = Math.max(75, Math.min(Math.floor((window.innerWidth * window.innerHeight) / 11000), 150));
    const particles: {
      x: number;
      y: number;
      r: number;
      baseR: number;
      dx: number;
      dy: number;
      opacity: number;
      hue: number;
      pulseSpeed: number;
      angle: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 2.2 + 0.8;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        baseR: r,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        opacity: Math.random() * 0.55 + 0.25,
        hue: Math.random() > 0.4 ? 155 : 185, // emerald & cyan/teal
        pulseSpeed: Math.random() * 0.03 + 0.01,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw particles
      particles.forEach((p) => {
        p.angle += p.pulseSpeed;
        const currentOpacity = p.opacity + Math.sin(p.angle) * 0.15;

        // Mouse gentle repel / attract
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < 140) {
          const force = (140 - distMouse) / 140;
          p.x -= (dxMouse / distMouse) * force * 1.5;
          p.y -= (dyMouse / distMouse) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${Math.max(0.1, currentOpacity)})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.4)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.dx;
        p.y += p.dy;

        // Wrap around boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      });

      // Draw constellation connections
      for (let i = 0; i < particles.length; i++) {
        // Connect to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 130) {
            const alpha = 0.18 * (1 - dist / 130);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor
        if (mouse.x > 0) {
          const distToMouse = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
          if (distToMouse < 160) {
            const alpha = 0.35 * (1 - distToMouse / 160);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(110, 231, 183, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="auth-shell">
      <div className="auth-bg-layer" aria-hidden="true">
        <canvas ref={canvasRef} className="auth-canvas" />
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <div className="auth-container">
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <div className="auth-brand">
              <ClixProLogo size="xl" animated className="auth-logo" textClassName="!text-white" />
            </div>

            <div className="auth-hero-text">
              <h1 className="auth-headline">
                Manage your sales.<br />
                <span className="auth-headline-accent">Grow faster.</span>
              </h1>
              <p className="auth-tagline">
                The simple CRM to track leads, manage pipelines, and close more deals.
              </p>
            </div>

            <ul className="auth-features">
              {FEATURES.map((f) => (
                <li key={f.label} className="auth-feature-item">
                  <span className="auth-feature-icon">{f.icon}</span>
                  <div>
                    <p className="auth-feature-label">{f.label}</p>
                    <p className="auth-feature-desc">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="auth-social-proof">
              <div className="auth-avatars">
                {["A", "B", "C", "D"].map((l, i) => (
                  <span key={i} className="auth-avatar" style={{ zIndex: 4 - i }}>
                    {l}
                  </span>
                ))}
              </div>
              <p className="auth-proof-text">
                <strong>2,400+ teams</strong> trust ClixPro
              </p>
            </div>

            <div className="auth-security-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-bit SSL • Secure & Encrypted</span>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-logo">
              <ClixProLogo size="lg" animated textClassName="!text-white" />
            </div>

            <div className="auth-card">
              <div className="auth-card-shimmer" />

              <AuthFormTransition>
                {title ? (
                  <>
                    <div className="auth-card-header">
                      <h2 className="auth-card-title">{title}</h2>
                      {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
                    </div>

                    {children}

                    {footerText && footerLink && footerLinkText && (
                      <p className="auth-card-footer-text">
                        {footerText}{" "}
                        <Link href={footerLink} className="auth-card-footer-link" prefetch>
                          {footerLinkText}
                        </Link>
                      </p>
                    )}
                  </>
                ) : (
                  children
                )}
              </AuthFormTransition>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
