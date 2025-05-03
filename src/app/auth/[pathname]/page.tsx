"use client";

import { AuthView } from "@/components/auth/auth-view";
import { useParams } from "next/navigation";

export default function AuthPage() {
  const params = useParams();
  const pathname = Array.isArray(params.pathname)
    ? params.pathname[0]
    : (params.pathname as string);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
}
