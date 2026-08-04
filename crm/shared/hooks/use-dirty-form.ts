import { useEffect, useRef, useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Enterprise-grade deep comparison for form values.
 * Ignores:
 * - Whitespace-only string changes
 * - Property order
 * - Falsy/Nullable equivalencies (null vs undefined vs "")
 */
export function compareFormValues(original: any, current: any): boolean {
  // Strict equality
  if (original === current) return true;

  // Normalize falsy values to empty strings for form inputs
  const normOriginal = original === null || original === undefined ? "" : original;
  const normCurrent = current === null || current === undefined ? "" : current;

  if (normOriginal === normCurrent) return true;

  // Handle Strings (ignore whitespace)
  if (typeof normOriginal === 'string' && typeof normCurrent === 'string') {
    return normOriginal.trim() === normCurrent.trim();
  }

  // Handle Dates
  if (normOriginal instanceof Date && normCurrent instanceof Date) {
    return normOriginal.getTime() === normCurrent.getTime();
  }
  if (normOriginal instanceof Date && typeof normCurrent === 'string') {
    return normOriginal.getTime() === new Date(normCurrent).getTime();
  }
  if (normCurrent instanceof Date && typeof normOriginal === 'string') {
    return new Date(normOriginal).getTime() === normCurrent.getTime();
  }

  // Handle Arrays
  if (Array.isArray(normOriginal) && Array.isArray(normCurrent)) {
    if (normOriginal.length !== normCurrent.length) return false;
    for (let i = 0; i < normOriginal.length; i++) {
      if (!compareFormValues(normOriginal[i], normCurrent[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle Objects
  if (
    typeof normOriginal === 'object' &&
    typeof normCurrent === 'object' &&
    normOriginal !== null &&
    normCurrent !== null &&
    !(normOriginal instanceof Date) &&
    !(normCurrent instanceof Date)
  ) {
    const keys1 = Object.keys(normOriginal).filter(k => normOriginal[k] !== undefined && normOriginal[k] !== null && normOriginal[k] !== "");
    const keys2 = Object.keys(normCurrent).filter(k => normCurrent[k] !== undefined && normCurrent[k] !== null && normCurrent[k] !== "");

    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      if (!compareFormValues(normOriginal[key], normCurrent[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

export function useDirtyForm<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  originalValues: Partial<T> | undefined | null,
  options?: {
    enableBeforeUnload?: boolean;
    externalOriginalValues?: any;
    externalValues?: any;
  }
) {
  const [isDirty, setIsDirty] = useState(false);
  const originalRef = useRef(originalValues);
  const externalOriginalRef = useRef(options?.externalOriginalValues);
  const externalCurrentRef = useRef(options?.externalValues);
  const { enableBeforeUnload = true } = options || {};

  // Update external refs
  useEffect(() => {
    externalOriginalRef.current = options?.externalOriginalValues;
    externalCurrentRef.current = options?.externalValues;
  }, [options?.externalOriginalValues, options?.externalValues]);

  const resetDirty = useCallback((newOriginalValues?: Partial<T>) => {
    if (newOriginalValues !== undefined) {
      originalRef.current = newOriginalValues;
    }
    const currentValues = form.getValues();
    const formDirty = !compareFormValues(originalRef.current || {}, currentValues);
    const externalDirty = !compareFormValues(externalOriginalRef.current, externalCurrentRef.current);
    setIsDirty(formDirty || externalDirty);
  }, [form]);

  // Keep original values up to date
  useEffect(() => {
    originalRef.current = originalValues;
    resetDirty();
  }, [originalValues, resetDirty]);

  // Subscription for field changes (avoids re-rendering the whole form)
  useEffect(() => {
    // Initial check
    resetDirty();

    const subscription = form.watch(() => {
      // 'value' from watch callback can sometimes be incomplete if the form is rendering.
      // using getValues() ensures we have the complete current state.
      const currentValues = form.getValues();
      const formDirty = !compareFormValues(originalRef.current || {}, currentValues);
      const externalDirty = !compareFormValues(externalOriginalRef.current, externalCurrentRef.current);
      setIsDirty(formDirty || externalDirty);
    });

    return () => subscription.unsubscribe();
  }, [form, resetDirty]);

  // Re-check when external values change
  useEffect(() => {
    resetDirty();
  }, [options?.externalValues, options?.externalOriginalValues, resetDirty]);

  // Handle browser beforeunload for unsaved changes
  useEffect(() => {
    if (enableBeforeUnload && isDirty) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ''; // Required for legacy browsers
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [enableBeforeUnload, isDirty]);

  return {
    isDirty,
    resetDirty,
    markClean: () => setIsDirty(false), // Force clean state
  };
}

/**
 * A simpler version of useDirtyForm for components that manage their own state
 * without react-hook-form.
 */
export function useDirtyState<T>(
  currentValues: T,
  originalValues: T,
  options?: { enableBeforeUnload?: boolean }
) {
  const [isDirty, setIsDirty] = useState(false);
  const { enableBeforeUnload = true } = options || {};

  // Deep comparison
  useEffect(() => {
    const dirty = !compareFormValues(originalValues, currentValues);
    setIsDirty(dirty);
  }, [currentValues, originalValues]);

  // Handle browser beforeunload for unsaved changes
  useEffect(() => {
    if (enableBeforeUnload && isDirty) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isDirty, enableBeforeUnload]);

  return { isDirty };
}
