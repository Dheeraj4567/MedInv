"use client"

import { useState } from "react"
import { useSQLCommands } from "@/lib/sql-command-context"
import { logSQLCommand } from "@/lib/actions"

export function useDatabaseOperation() {
  const [isLoading, setIsLoading] = useState(false)
  const { addCommand, updateCommandStatus } = useSQLCommands()

  async function executeOperation<T>({
    operation,
    sqlCommand,
    table,
    onSuccess,
    onError,
  }: {
    operation: () => Promise<T>
    sqlCommand: string
    table: string
    onSuccess?: (result: T) => void
    onError?: (error: Error) => void
  }) {
    setIsLoading(true)
    const commandId = addCommand({
      command: sqlCommand,
      table,
    })

    try {
      const result = await operation()

      // Log the SQL command to the server
      await logSQLCommand({
        command: sqlCommand,
        table,
        status: "success",
      })

      updateCommandStatus(commandId, "success")
      onSuccess?.(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      // Log the SQL command with error to the server
      await logSQLCommand({
        command: sqlCommand,
        table,
        status: "error",
        error: errorMessage,
      })

      updateCommandStatus(commandId, "error", errorMessage)
      onError?.(error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    executeOperation,
    isLoading,
  }
}

