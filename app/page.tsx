"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#ff7a00] font-mono text-xs">
      [REDIRECTING TO AUTHENTICATION PORTAL...]
    </div>
  );
}
