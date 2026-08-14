"use client";

import dynamic from 'next/dynamic';

const FloatingAssistant = dynamic(() => import('@/components/ai/floating-assistant'), {
  ssr: false,
});

export default function FloatingAssistantWrapper() {
  return <FloatingAssistant />;
}
