/**
 * GHXSTSHIP Toast Notifications
 * Geometric styling with thick borders and hard edges
 */

"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-3 group-[.toaster]:border-black group-[.toaster]:shadow-geometric font-share",
          description: "group-[.toast]:text-grey-700 group-[.toast]:font-share",
          actionButton:
            "group-[.toast]:bg-black group-[.toast]:text-white group-[.toast]:border-3 group-[.toast]:border-black group-[.toast]:font-bebas group-[.toast]:uppercase group-[.toast]:hover:bg-white group-[.toast]:hover:text-black group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:border-3 group-[.toast]:border-black group-[.toast]:font-bebas group-[.toast]:uppercase group-[.toast]:hover:bg-black group-[.toast]:hover:text-white group-[.toast]:transition-colors",
          success: "group-[.toast]:border-black",
          error: "group-[.toast]:border-black group-[.toast]:bg-grey-100",
          warning: "group-[.toast]:border-black",
          info: "group-[.toast]:border-black",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
