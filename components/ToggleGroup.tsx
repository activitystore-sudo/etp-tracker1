"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { Slot } from "@radix-ui/react-slot"
import styles from "./ToggleGroup.module.css"

const ToggleGroupContext = React.createContext<{
  variant: "default" | "outline"
  size: "sm" | "md" | "lg"
}>({
  variant: "default",
  size: "md",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: "default" | "outline"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "default", size = "md", children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={`${styles.toggleGroup} ${className || ""}`}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={`${styles.item} ${styles[context.variant]} ${styles[context.size]} ${className || ""}`}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }