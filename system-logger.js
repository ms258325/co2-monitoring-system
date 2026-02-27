const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(logDir, 'system.log') })
    ]
});

logger.saveAccessLog = (req, res, duration) => {
    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const logLine = `[${timestamp}] IP:${ip} | ${req.method} ${req.originalUrl} | Status:${res.statusCode} | Time:${duration}ms | Agent:${req.get('User-Agent')}\n`;
    const accessLogFile = path.join(logDir, `access_${date}.log`);
    
    fs.appendFile(accessLogFile, logLine, (err) => {
        if (err) console.error("접속 로그 저장 중 에러 발생:", err);
    });
};

module.exports = logger;