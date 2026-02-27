import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardPanels from './components/DashboardPanels';
import PfdLayout from './components/pfd-layout'; 
import './App.css';

function App() {
  const [allData, setAllData] = useState({}); 
  const [histories, setHistories] = useState({}); 
  const [viewMode, setViewMode] = useState('DASHBOARD'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        const latestAll = response.data;
        setAllData(latestAll);

        setHistories(prev => {
          const newHistories = { ...prev };
          Object.keys(latestAll).forEach(id => {
            const currentItem = latestAll[id];
            const prevHistory = newHistories[id] || [];
            newHistories[id] = [
              ...prevHistory, 
              { ...currentItem, time: new Date().toLocaleTimeString() }
            ].slice(-20);
          });
          return newHistories;
        });
      } catch (error) {
        console.error("데이터 수신 에러:", error);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // 장치 번호순 정렬
  const deviceIds = Object.keys(allData).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  return (
    <div className="dashboard-root">
      {/* 공통 헤더  */}
      <header className="header-bar" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1> CO2 통합 관제 시스템</h1>
          <div style={{ color: '#7b7b7b' }}>연결된 장치: <strong>{deviceIds.length}</strong> 대</div>
        </div>

        {/* UI 전환 버튼 */}
        <button 
          onClick={() => setViewMode(viewMode === 'DASHBOARD' ? 'PFD' : 'DASHBOARD')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', background: '#3274d9', color: '#fff', border: 'none', alignSelf: 'center' }}
        >
          {viewMode === 'DASHBOARD' ? 'PFD 보기' : ' 대시보드 보기'}
        </button>
      </header>

      {deviceIds.length === 0 ? (
        <div className="loading">장치로부터 데이터를 기다리는 중입니다...</div>
      ) : (
        <>
          {/* 기존 대시보드 화면 */}
          {viewMode === 'DASHBOARD' && (
            <main style={{ display: 'flex', flexDirection: 'column', gap: '50px', marginTop: '20px' }}>
              {deviceIds.map(id => (
                <div key={id} className="device-section" style={{ borderBottom: '1px solid #333', paddingBottom: '40px' }}>
                  <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ color: '#fff', margin: 0 }}>{id}</h2>
                    <span className={`status-badge ${allData[id].status === 'Normal' ? 'operating' : 'warning'}`}>
                       ● {allData[id].status?.toUpperCase()}
                    </span>
                  </div>
                  <DashboardPanels 
                    deviceId={id} 
                    data={allData[id]} 
                    history={histories[id] || []} 
                  />
                </div>
              ))}
            </main>
          )}

          {/* PFD 화면  */}
          {viewMode === 'PFD' && (
            <div style={{ marginTop: '20px' }}>
              <PfdLayout allData={allData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;