"use client";

import { useEffect } from "react";
import { AuthView } from "@/components/auth-view";
import { useParams } from "next/navigation";

export default function AuthPage() {
  const params = useParams();
  const pathname = Array.isArray(params.pathname) ? params.pathname[0] : params.pathname as string;
  
  return <AuthView pathname={pathname} />;
}
