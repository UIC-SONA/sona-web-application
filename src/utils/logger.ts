const LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const levels = ['trace', 'debug', 'info', 'warn', 'error'];

// Índice del nivel actual
const currentLevelIndex = levels.indexOf(LEVEL);
if (currentLevelIndex === -1) {
  throw new Error(`Invalid LOG_LEVEL: ${LEVEL}`);
}

// Mapa de niveles habilitados
const levelMap: Record<string, boolean> = {};
levels.forEach((level, index) => {
  levelMap[level] = index >= currentLevelIndex;
});

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = {
  trace: (message: string, ...optionalParams: any[]) => {
    if (levelMap.trace) console.trace(`[TRACE] ${message}`, ...optionalParams);
  },
  
  debug: (message: string, ...optionalParams: any[]) => {
    if (levelMap.debug) console.debug(`[DEBUG] ${message}`, ...optionalParams);
  },
  
  info: (message: string, ...optionalParams: any[]) => {
    if (levelMap.info) console.info(`[INFO] ${message}`, ...optionalParams);
  },
  
  warn: (message: string, ...optionalParams: any[]) => {
    if (levelMap.warn) console.warn(`[WARN] ${message}`, ...optionalParams);
  },
  
  error: (message: string, ...optionalParams: any[]) => {
    if (levelMap.error) console.error(`[ERROR] ${message}`, ...optionalParams);
  },
  
  isLevelEnabled: (level: string) => levelMap[level] || false,
  
  level: LEVEL
}

export default logger;
