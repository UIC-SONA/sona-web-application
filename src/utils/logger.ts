const LEVEL = process.env.LOG_LEVEL || 'info'

const levelMatrix = [
  ['trace', 'debug', 'info', 'warn', 'error'],
  ['debug', 'info', 'warn', 'error'],
  ['info', 'warn', 'error'],
  ['warn', 'error'],
  ['error']
]

const isTraceEnabled = levelMatrix[0].includes(LEVEL)
const isDebugEnabled = levelMatrix[1].includes(LEVEL)
const isInfoEnabled = levelMatrix[2].includes(LEVEL)
const isWarnEnabled = levelMatrix[3].includes(LEVEL)
const isErrorEnabled = levelMatrix[4].includes(LEVEL)

const levelMap: Record<string, boolean> = {
  trace: isTraceEnabled,
  debug: isDebugEnabled,
  info: isInfoEnabled,
  warn: isWarnEnabled,
  error: isErrorEnabled
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = {
  trace: (message: string, ...optionalParams: any[]) => {
    if (isTraceEnabled) console.trace(`[TRACE] ${message}`, ...optionalParams)
  },
  
  debug: (message: string, ...optionalParams: any[]) => {
    if (isDebugEnabled) console.debug(`[DEBUG] ${message}`, ...optionalParams)
  },
  
  info: (message: string, ...optionalParams: any[]) => {
    if (isInfoEnabled) console.info(`[INFO] ${message}`, ...optionalParams)
  },
  
  warn: (message: string, ...optionalParams: any[]) => {
    if (isWarnEnabled) console.warn(`[WARN] ${message}`, ...optionalParams)
  },
  
  error: (message: string, ...optionalParams: any[]) => {
    if (isErrorEnabled) console.error(`[ERROR] ${message}`, ...optionalParams)
  },
  
  isLevelEnabled: (level: string) => levelMap[level] || false,
  
  level: LEVEL
}

export default logger