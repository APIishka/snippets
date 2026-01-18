class Logger {
  static instance;

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    
    this.logs = [];
    Logger.instance = this;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.logs.push({ message, timestamp });
    console.log(`[${timestamp}] ${message}`);
  }

  getLogs() {
    return this.logs;
  }
}

const logger1 = new Logger();
const logger2 = new Logger();

logger1.log('First message');
logger2.log('Second message');

console.log(logger1 === logger2);
console.log(logger1.getLogs());
