import * as os from 'os'
import * as util from 'util'
import * as fs from 'fs'
import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
export function getKubectlArch(): string {
   const arch = os.arch()
   if (arch === 'x64') {
      return 'amd64'
   }
   return arch
}

export function getkubectlDownloadURL(version: string, arch: string): string {
   switch (os.type()) {
      case 'Linux':
         return `https://dl.k8s.io/release/${version}/bin/linux/${arch}/kubectl`

      case 'Darwin':
         return `https://dl.k8s.io/release/${version}/bin/darwin/${arch}/kubectl`

      case 'Windows_NT':
      default:
         return `https://dl.k8s.io/release/${version}/bin/windows/${arch}/kubectl.exe`
   }
}

export async function getLatestPatchVersion(
   major: string,
   minor: string
): Promise<string> {
   const version = `${major}.${minor}`
   const sourceURL = `https://cdn.dl.k8s.io/release/stable-${version}.txt`
   try {
      const downloadPath = await toolCache.downloadTool(sourceURL)
      const latestPatch = fs
         .readFileSync(downloadPath, 'utf8')
         .toString()
         .trim()
      if (!latestPatch) {
         throw new Error(`No patch version found for ${version}`)
      }
      return latestPatch
   } catch (error) {
      core.debug('Download error:')
      core.debug(getErrorDetails(error))
      core.warning('GetLatestPatchVersionFailed')
      throw new Error(`Failed to get latest patch version for ${version}`)
   }
}

function getErrorDetails(error: unknown): string {
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

export function getExecutableExtension(): string {
   if (os.type().match(/^Win/)) {
      return '.exe'
   }
   return ''
}
