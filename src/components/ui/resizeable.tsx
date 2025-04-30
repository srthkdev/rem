import { GripVertical } from "lucide-react"
import * as ResizeablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

const ResizeablePanel = ResizeablePrimitive.Panel

const ResizeableHandle = ({
  withHandle,
  className,
}: {
  withHandle?: boolean
  className?: string
}) => (
  <ResizeablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      className
    )}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizeablePrimitive.PanelResizeHandle>
)

export { ResizeablePanel, ResizeableHandle } 