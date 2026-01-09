export function getErrorDetails(error: unknown): string {
   const details: string[] = []
   const MAX_ERRORS_TO_LOG = 5
   const MAX_STACK_TRACE_LINES = 10

   if (error instanceof Error) {
      // Log error name/type
      details.push(`Error type: ${error.constructor.name}`)

      // Log error message
      if (error.message) {
         details.push(`Error message: ${error.message}`)
      }

      // Log error code if available
      if ('code' in error && error.code) {
         details.push(`Error code: ${error.code}`)
      }

      // For AggregateError, log all individual errors (up to MAX_ERRORS_TO_LOG)
      // Note: Using duck typing for broader compatibility with error-like objects
      if ('errors' in error && Array.isArray(error.errors)) {
         const errorCount = error.errors.length
         details.push(`Number of errors: ${errorCount}`)
         const errorsToLog = Math.min(errorCount, MAX_ERRORS_TO_LOG)

         for (let i = 0; i < errorsToLog; i++) {
            const err = error.errors[i]
            details.push(
               `Error ${i + 1}: ${err instanceof Error ? err.message : String(err)}`
            )
            if (err instanceof Error && err.stack) {
               const truncatedStack = truncateStackTrace(
                  err.stack,
                  MAX_STACK_TRACE_LINES
               )
               details.push(`Stack trace ${i + 1}: ${truncatedStack}`)
            }
         }

         if (errorCount > MAX_ERRORS_TO_LOG) {
            details.push(
               `... and ${errorCount - MAX_ERRORS_TO_LOG} more error(s)`
            )
         }
      }

      // Log stack trace (truncated)
      if (error.stack) {
         const truncatedStack = truncateStackTrace(
            error.stack,
            MAX_STACK_TRACE_LINES
         )
         details.push(`Stack trace: ${truncatedStack}`)
      }

      // Log any other properties
      const standardProps = ['name', 'message', 'stack', 'code', 'errors']
      const otherProps = Object.keys(error).filter(
         (key) => !standardProps.includes(key)
      )
      if (otherProps.length > 0) {
         otherProps.forEach((prop) => {
            const value = (error as any)[prop]
            try {
               const jsonValue = JSON.stringify(value)
               // Limit the size of the serialized value
               const truncatedValue =
                  jsonValue.length > 500
                     ? jsonValue.substring(0, 500) + '...(truncated)'
                     : jsonValue
               details.push(`${prop}: ${truncatedValue}`)
            } catch (e) {
               details.push(`${prop}: <unable to serialize>`)
            }
         })
      }
   } else {
      details.push(`Non-Error object: ${String(error)}`)
      details.push(`Type: ${typeof error}`)
      if (error !== null && typeof error === 'object') {
         try {
            const jsonValue = JSON.stringify(error)
            // Limit the size of the serialized value
            const truncatedValue =
               jsonValue.length > 500
                  ? jsonValue.substring(0, 500) + '...(truncated)'
                  : jsonValue
            details.push(`Properties: ${truncatedValue}`)
         } catch (e) {
            details.push(`Properties: <unable to serialize>`)
         }
      }
   }

   return details.join('\n')
}

function truncateStackTrace(stack: string, maxLines: number): string {
   const lines = stack.split('\n')
   if (lines.length <= maxLines) {
      return stack
   }
   return (
      lines.slice(0, maxLines).join('\n') +
      `\n... (${lines.length - maxLines} more lines)`
   )
}
