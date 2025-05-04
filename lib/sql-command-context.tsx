"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface SQLCommand {
  id: string
  command: string
  table: string
  timestamp: Date
  status: "pending" | "success" | "error"
  error?: string
}

interface SQLCommandContextType {
  commands: SQLCommand[]
  addCommand: (command: Omit<SQLCommand, "id" | "timestamp" | "status">) => string
  updateCommandStatus: (id: string, status: "success" | "error", error?: string) => void
  clearCommands: () => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
  isMinimized: boolean
  setIsMinimized: (minimized: boolean) => void
}

const SQLCommandContext = createContext<SQLCommandContextType | undefined>(undefined)

export function SQLCommandProvider({ children }: { children: React.ReactNode }) {
  const [commands, setCommands] = useState<SQLCommand[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Keep only the last 20 commands
  useEffect(() => {
    if (commands.length > 20) {
      setCommands((prev) => prev.slice(-20))
    }
  }, [commands])

  const addCommand = (command: Omit<SQLCommand, "id" | "timestamp" | "status">) => {
    const id = `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    setCommands((prev) => [
      ...prev,
      {
        ...command,
        id,
        timestamp: new Date(),
        status: "pending",
      },
    ])

    setIsVisible(true)
    return id
  }

  const updateCommandStatus = (id: string, status: "success" | "error", error?: string) => {
    setCommands((prev) => prev.map((cmd) => (cmd.id === id ? { ...cmd, status, ...(error ? { error } : {}) } : cmd)))
  }

  const clearCommands = () => {
    setCommands([])
  }

  return (
    <SQLCommandContext.Provider
      value={{
        commands,
        addCommand,
        updateCommandStatus,
        clearCommands,
        isVisible,
        setIsVisible,
        isMinimized,
        setIsMinimized,
      }}
    >
      {children}
    </SQLCommandContext.Provider>
  )
}

export function useSQLCommands() {
  const context = useContext(SQLCommandContext)
  if (context === undefined) {
    throw new Error("useSQLCommands must be used within a SQLCommandProvider")
  }
  return context
}

