export function getErrorDetails(error: unknown): string {
   const details: string[] = []

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

      // For AggregateError, log all individual errors
      if ('errors' in error && Array.isArray(error.errors)) {
         details.push(`Number of errors: ${error.errors.length}`)
         error.errors.forEach((err, index) => {
            details.push(
               `Error ${index + 1}: ${err instanceof Error ? err.message : String(err)}`
            )
            if (err instanceof Error && err.stack) {
               details.push(`Stack trace ${index + 1}: ${err.stack}`)
            }
         })
      }

      // Log stack trace
      if (error.stack) {
         details.push(`Stack trace: ${error.stack}`)
      }

      // Log any other properties
      const standardProps = ['name', 'message', 'stack', 'code', 'errors']
      const otherProps = Object.keys(error).filter(
         (key) => !standardProps.includes(key)
      )
      if (otherProps.length > 0) {
         details.push(`Other properties: ${JSON.stringify(otherProps)}`)
         otherProps.forEach((prop) => {
            const value = (error as any)[prop]
            details.push(`${prop}: ${JSON.stringify(value)}`)
         })
      }
   } else {
      details.push(`Non-Error object: ${String(error)}`)
      details.push(`Type: ${typeof error}`)
      if (error !== null && typeof error === 'object') {
         details.push(`Properties: ${JSON.stringify(error, null, 2)}`)
      }
   }

   return details.join('\n')
}
