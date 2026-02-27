let latestData = {}; 

let hasLoggedSuccess = {}; 

const updateDeviceData = (deviceId, data) => {
    latestData[deviceId] = { 
        ...data, 
        server_time: new Date().toISOString() 
    };
};

const getStoredData = (deviceId = null) => {
    if (deviceId) {
        return latestData[deviceId] || null;
    }
    return latestData;
};

// 첫 연결시 로그 출력용
const checkFirstConnection = (deviceId) => {
    if (!hasLoggedSuccess[deviceId]) {
        hasLoggedSuccess[deviceId] = true;
        return true;
    }
    return false;
};

module.exports = {
    updateDeviceData,
    getStoredData,
    checkFirstConnection
};