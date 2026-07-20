"use client";

/**
 * AuthLoadingScreen
 *
 * Full-page branded loading screen shown during auth initialization.
 * Prevents the blank white flash or redirect-to-login flicker that
 * occurs while we wait for localStorage to be read client-side.
 */

import { motion } from "framer-motion";

export default function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-info/5" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
          <div className="relative flex items-center justify-center bg-gradient-to-br from-primary to-emerald-600 shadow-2xl shadow-primary/30 border border-white/20 rounded-2xl w-20 h-20 font-black text-white text-3xl">
            CR
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="font-bold text-foreground text-2xl tracking-tight">
            ClixProCRM
          </h1>
          <p className="mt-1 text-muted-foreground text-sm font-medium">
            Restoring your session...
          </p>
        </motion.div>

        {/* Animated progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="w-48"
        >
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
