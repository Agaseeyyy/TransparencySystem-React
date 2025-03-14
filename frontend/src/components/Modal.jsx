"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      modalRef.current?.focus()
      document.body.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = "auto"
      }
    }
  }, [isOpen])

  // If modal is not open, don't render
  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden bg-white shadow-lg rounded-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <motion.h3
                id="modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {title}
              </motion.h3>
              <motion.button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-md",
                  "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  "transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
                onClick={onClose}
                aria-label="Close modal"
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <motion.div
              className="p-4 md:p-5 overflow-y-auto max-h-[calc(100vh-10rem)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal

