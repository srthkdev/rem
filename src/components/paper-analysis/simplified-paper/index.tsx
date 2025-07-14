import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { projects } from "@/database/schema";

const MODES = [
  { key: "eli5", label: "For Kids (ELI5)" },
  { key: "college", label: "College Level" },
  { key: "expert", label: "Expert Level" },
] as const;

interface SimplifiedPaperProps {
  project: typeof projects.$inferSelect;
}

export function SimplifiedPaper({ project }: SimplifiedPaperProps) {
  const [mode, setMode] = useState("eli5");
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
          Simplified Paper
        </h3>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={[
                "min-w-[180px] flex items-center justify-between gap-2 transition-colors",
                open ? "text-[#C96442] border-[#C96442]" : "",
                "hover:text-[#C96442] focus:text-[#C96442]",
              ].join(" ")}
            >
              <span>{MODES.find((m) => m.key === mode)?.label}</span>
              <ChevronDown className="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
              {MODES.map((m) => (
                <DropdownMenuRadioItem
                  key={m.key}
                  value={m.key}
                  className={[
                    mode === m.key
                      ? "!bg-[#E3DACC] dark:!bg-[#BFB8AC]/10 font-semibold text-[#262625] dark:text-[#FAF9F6]"
                      : "hover:text-[#C96442] focus:text-[#C96442]",
                    "relative pl-4",
                  ].join(" ")}
                >
                  {m.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        {mode === "eli5" && <div className="prose dark:prose-invert max-w-none"><p>{project.summaryEli5 || "Summary not available."}</p></div>}
        {mode === "college" && <div className="prose dark:prose-invert max-w-none"><p>{project.summaryCollege || "Summary not available."}</p></div>}
        {mode === "expert" && <div className="prose dark:prose-invert max-w-none"><p>{project.summaryExpert || "Summary not available."}</p></div>}
      </div>
    </div>
  );
}
