import React, { useState } from "react";
import { ELI5Paper } from "./eli5-paper";
import { CollegePaper } from "./college-paper";
import { ExpertPaper } from "./expert-paper";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const MODES = [
  { key: "eli5", label: "Explain Like I'm 5 (ELI5)" },
  { key: "college", label: "College Student" },
  { key: "expert", label: "Expert" },
];

export function SimplifiedPaper() {
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
        {mode === "eli5" && <ELI5Paper />}
        {mode === "college" && <CollegePaper />}
        {mode === "expert" && <ExpertPaper />}
      </div>
    </div>
  );
}
