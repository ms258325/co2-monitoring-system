const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const saveToCSV = (data) => {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${data.device_id}_${date}.csv`); 

    if (!fs.existsSync(logFile)) {
        const header = "Time, Status, Device_ID, Input_PPM, Output_PPM, Efficiency, Flow_Rate, Temp, Pressure, Energy_Cons, Runtime\n";
        fs.writeFileSync(logFile, header);
    }

    const logLine = `${new Date().toLocaleString()},${data.status},${data.device_id},${data.input_ppm},${data.output_ppm},${data.efficiency},${data.flow_rate},${data.temp},${data.pressure},${data.energy_cons},${data.runtime}\n`;
    
    fs.appendFile(logFile, logLine, (err) => {
        if (err) console.error(`[CSV 저장 실패] ${data.device_id}:`, err);
    });
};

module.exports = { saveToCSV };