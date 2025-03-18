import { Log, LogCollector, LogFunction, LogLevel, LogLevels } from "@/type/log";


export function createLogCollector(): LogCollector {
  const logs: Log[] = [];
  const getAll = () => logs;

  const logFunctions = {} as Record<LogLevel,LogFunction>;
  LogLevels.forEach(level => logFunctions[level]= (message) =>(
    logs.push({message,level,timestamp:new Date()})
  ))
  return {
    getAll,
    ...logFunctions
  }
}