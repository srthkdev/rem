import React from "react"
import { Brain, Zap, Network, Cpu } from "lucide-react"

export function ResearchAnalysisTab() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-[#262625] dark:text-[#FAF9F6]">Transformer Architecture Analysis</h3>
      
      <div className="space-y-4">
        {/* Architecture Overview */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-[#C96442]" />
            <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">Architecture Overview</h4>
          </div>
          <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
            The transformer architecture introduces a novel attention mechanism that processes sequential data without recurrence. Key components include multi-head self-attention, positional encoding, and feed-forward networks.
          </p>
        </div>

        {/* Attention Mechanism */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-[#C96442]" />
            <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">Self-Attention Mechanism</h4>
          </div>
          <ul className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] space-y-2">
            <li>• Query, Key, Value transformations enable parallel processing</li>
            <li>• Multi-head attention allows focus on different aspects simultaneously</li>
            <li>• Scaled dot-product attention ensures stable gradients</li>
          </ul>
        </div>

        {/* Model Components */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-5 w-5 text-[#C96442]" />
            <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">Key Components</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">Encoder</p>
              <ul className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] list-disc pl-4 space-y-1">
                <li>Self-attention layers</li>
                <li>Position-wise FFN</li>
                <li>Layer normalization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">Decoder</p>
              <ul className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] list-disc pl-4 space-y-1">
                <li>Masked attention</li>
                <li>Cross-attention</li>
                <li>Output probabilities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-5 w-5 text-[#C96442]" />
            <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">Performance Analysis</h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-1">Computational Efficiency</p>
              <div className="h-2 bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#C96442] rounded-full" style={{ width: "85%" }}></div>
              </div>
              <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC] mt-1">85% faster than RNN-based models</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-1">Parallelization</p>
              <div className="h-2 bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#C96442] rounded-full" style={{ width: "95%" }}></div>
              </div>
              <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC] mt-1">95% reduction in training time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 