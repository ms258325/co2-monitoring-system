const express = require('express');
const router = express.Router();
const store = require('./state-store');


router.get('/data', (req, res) => {
    const { device_id } = req.query;
    const data = store.getStoredData(device_id);

    if (device_id && !data) {
        return res.status(202).json({ 
            message: `${device_id} 기기의 데이터를 수집 중입니다.`,
            status: 'waiting'
        });
    }

    res.json(data);
});


module.exports = router;