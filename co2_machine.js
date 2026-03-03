const net = require('net');
const fs = require('fs');
const path = require('path');

// ex) co2_machine.js ABS-07
const deviceId = process.argv[2] || 'ABS-01'; 
const dataPath = path.join(__dirname, 'temporary_datas', `device_${deviceId}.json`);
const SERVER_IP = process.env.SERVER_IP || '127.0.0.1';
const SERVER_PORT = 5000;

let client = null;
let dataInterval = null;
let rawData = [];

// 데이터 로드
try {
    rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (err) {
    console.error(`[에러] 데이터를 불러올 수 없습니다: ${dataPath}`);
    process.exit(1);
}

let index = 0;

function connectToServer() {
    client = new net.Socket();

    client.connect(SERVER_PORT, SERVER_IP, () => {
        console.log(`[${deviceId}] 서버 연결 성공!`);
        
        // 데이터 송신 시작
        dataInterval = setInterval(() => {
            if (rawData[index]) {
                const payload = JSON.stringify(rawData[index]) + '\n';
                client.write(payload);
                index = (index + 1) % rawData.length;
            }
        }, 100); // 0.1초 주기
    });

    // 서버와 연결이 끊기면 재연결 시도
    client.on('close', () => {
        console.log(`[${deviceId}] 연결 끊김. 5초 후 다시 시도합니다...`);
        cleanup();
        setTimeout(connectToServer, 5000); // 5초 후 재접속 시도
    });

    client.on('error', (err) => {
        console.error(`[${deviceId}] 통신 에러: ${err.message}`);
    });
}

function cleanup() {
    if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
    }
    if (client) {
        client.destroy();
        client = null;
    }
}

// 최초 실행
connectToServer();

// 종료 처리
process.on('SIGINT', () => {
    console.log(`\n[${deviceId}] 시뮬레이터를 종료합니다.`);
    cleanup();
    process.exit(0);
});