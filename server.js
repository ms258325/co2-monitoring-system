require('dotenv').config(); // .env 로드
const net = require('net');
const express = require('express');
const path = require('path');
const cors = require('cors');

// 모듈화
const logger = require('./system-logger');       
const apiRoutes = require('./api-routes');        
const { handleTcpConnection } = require('./tcp-router');

const PORT_TCP = process.env.PORT_TCP || 5000;
const PORT_WEB = process.env.PORT_WEB || 4000;

const app = express();
app.use(cors());

const loggedPaths = new Set();
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logKey = `${req.method}:${req.originalUrl}`;
        
        if (res.statusCode !== 200 || !loggedPaths.has(logKey)) {
            logger.info(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
            if (res.statusCode === 200) loggedPaths.add(logKey);
        }

        // 시스템 엑세스 로그 저장 로직 호출
        logger.saveAccessLog(req, res, duration);
    });
    next();
});

app.use(express.static(path.join(__dirname, 'co2-frontend', 'dist')));

app.use('/api', apiRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'co2-frontend', 'dist', 'index.html'));
});

const tcpServer = net.createServer(handleTcpConnection);

tcpServer.listen(PORT_TCP, () => {
    logger.info(`[READY] TCP 수집 서버 가동 성공 (Port: ${PORT_TCP})`);
});

const webServer = app.listen(PORT_WEB, () => {
    logger.info(`[READY] 통합 웹 대시보드 가동: http://${process.env.SERVER_IP}:${PORT_WEB}`);
});

process.on('SIGINT', () => {
    logger.info('시스템 종료 프로세스를 시작합니다...');
    tcpServer.close(() => {
        webServer.close(() => {
            logger.info('모든 서버가 종료 되엇습니다. ');
            process.exit(0);
        });
    });
});