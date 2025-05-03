import React, { useState } from "react";
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function AIPodcastTab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Player Section */}
        <div className="p-6 rounded-lg bg-white dark:bg-[#1A1A1A] shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C96442] flex items-center justify-center">
              <Headphones className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
                Paper Discussion
              </h3>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                10:45 minutes
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                className="w-full"
                onValueChange={(value) => setProgress(value[0])}
              />
              <div className="flex justify-between text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                <span>0:00</span>
                <span>10:45</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#C96442]"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-[#C96442] hover:bg-[#C96442]/90 text-white"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#C96442]"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <Volume2 className="h-4 w-4 text-[#262625]/70 dark:text-[#BFB8AC]" />
              <Slider
                defaultValue={[75]}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="space-y-4">
          <h4 className="font-medium text-[#262625] dark:text-[#FAF9F6]">
            Transcript Highlights
          </h4>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">
                  Introduction
                </p>
                <span className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                  00:00 - 02:30
                </span>
              </div>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                Welcome to this AI-generated discussion of the transformer
                architecture. Today, we&apos;ll explore how this groundbreaking
                model revolutionized natural language processing and why it
                remains fundamental to modern AI systems.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">
                  Key Concepts
                </p>
                <span className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                  02:31 - 05:45
                </span>
              </div>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                The transformer&apos;s self-attention mechanism allows it to
                process all input tokens simultaneously, unlike traditional
                RNNs. This parallel processing capability, combined with the
                ability to capture long-range dependencies, makes it
                particularly powerful.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">
                  Impact & Applications
                </p>
                <span className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">
                  05:46 - 10:45
                </span>
              </div>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                The transformer architecture has enabled breakthrough
                achievements in various domains, from language models like GPT
                to vision transformers. Its scalability and effectiveness have
                made it the foundation for many modern AI systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
