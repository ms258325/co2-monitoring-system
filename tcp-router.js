const logger = require('./system-logger');
const { saveToCSV } = require('./data-logger');
const store = require('./state-store');

let lastErrorTime = 0;

// TCP 소켓의 데이터 수신 로직을 처리하는 함수
const handleTcpConnection = (socket) => {
    logger.info(`[TCP] 장치 접속: ${socket.remoteAddress}`);
    let buffer = '';

    socket.on('data', (data) => {
        buffer += data.toString();
        let boundary = buffer.indexOf('\n');

        while (boundary !== -1) {
            const packet = buffer.substring(0, boundary).trim();
            buffer = buffer.substring(boundary + 1);

            if (packet) {
                try {
                    const parsed = JSON.parse(packet);
                    const dId = parsed.device_id;

                    // 상태 저장소 업데이트
                    store.updateDeviceData(dId, parsed);
                    
                    // CSV 파일 기록
                    saveToCSV(parsed);

                    // 최초 연결 시에만 성공 로그 출력
                    if (store.checkFirstConnection(dId)) {
                        logger.info(`[SUCCESS] ${dId} 기기 수신 시작`);
                    }

                } catch (e) {
                    const now = Date.now();
                    if (now - lastErrorTime > 10000) {
                        logger.error(`[ERROR] 데이터 파싱 실패 (10초 주기 알림)`);
                        lastErrorTime = now;
                    }
                }
            }
            boundary = buffer.indexOf('\n');
        }
    });

    socket.on('end', () => logger.warn('[TCP] 장치 연결 종료'));
    socket.on('error', (err) => logger.error(`[TCP] 소켓 에러: ${err.message}`));
};

module.exports = { handleTcpConnection };