"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const colors = [
    "#ff6b6b",
    "#ff9ff3",
    "#feca57",
    "#ff9f43",
    "#1dd1a1",
    "#5f27cd",
    "#54a0ff",
    "#00d2d3",
    "#222f3e",
    "#576574",
    "#c8d6e5",
    "#ffffff",
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-full h-10 rounded-md border border-custom-secondary/30 flex items-center justify-between px-3"
          style={{ backgroundColor: color }}
        >
          <span className="font-mono text-xs bg-custom-dark/80 text-custom-text px-1 rounded">{color}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-custom-dark border-custom-secondary/30">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className="w-12 h-12 rounded-md border border-custom-secondary/30"
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c)
                setIsOpen(false)
              }}
            />
          ))}
        </div>
        <div className="flex items-center mt-4">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-custom-secondary/30 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 ml-2 px-3 py-2 rounded-md border border-custom-secondary/30 bg-custom-input text-custom-text"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

