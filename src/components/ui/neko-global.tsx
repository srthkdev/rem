"use client";
import { NekoCursor } from "./neko-cursor";
import { useAppearanceStore } from "@/lib/store/appearance-store";

export function NekoGlobal() {
  const nekoEnabled = useAppearanceStore((s) => s.nekoEnabled);
  return <NekoCursor enabled={nekoEnabled} />;
}
