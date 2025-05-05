import React from "react";
import collegeData from "./college.json";

export function CollegePaper() {
  return (
    <div className="space-y-4">
      {collegeData.sections.map(
        (section: { title: string; content: string }, idx: number) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-[#E3DACC]/70 dark:bg-[#BFB8AC]/10"
          >
            <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">
              {section.title}
            </h4>
            <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
              {section.content}
            </p>
          </div>
        ),
      )}
    </div>
  );
}
