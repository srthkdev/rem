import React from "react";
import { LineChart, BarChart, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisualizationTab() {
  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Attention Visualization */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-[#C96442]" />
              <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
                Attention Patterns
              </h3>
            </div>
            <Button variant="outline" size="sm">
              Explore Layer
            </Button>
          </div>
          <div className="aspect-video bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#E3DACC] dark:border-[#BFB8AC]/30 p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2">
                Interactive attention pattern visualization
              </p>
              <p className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/50">
                Click to explore attention heads and layers
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="h-5 w-5 text-[#C96442]" />
              <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">
                Training Progress
              </h4>
            </div>
            <div className="aspect-square bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#E3DACC] dark:border-[#BFB8AC]/30 p-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2">
                  Loss vs. Epochs
                </p>
                <p className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/50">
                  Interactive training metrics chart
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart className="h-5 w-5 text-[#C96442]" />
              <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">
                Layer Analysis
              </h4>
            </div>
            <div className="aspect-square bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#E3DACC] dark:border-[#BFB8AC]/30 p-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2">
                  Layer-wise Performance
                </p>
                <p className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/50">
                  Interactive layer metrics chart
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6] mb-4">
            Architecture Overview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">
                Model Size
              </p>
              <p className="text-2xl font-bold text-[#C96442]">125M</p>
              <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                parameters
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">
                Attention Heads
              </p>
              <p className="text-2xl font-bold text-[#C96442]">12</p>
              <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                per layer
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">
                Model Depth
              </p>
              <p className="text-2xl font-bold text-[#C96442]">24</p>
              <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                layers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
