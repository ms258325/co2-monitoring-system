import React from 'react';
import ProcessFlowDiagram from './ProcessFlowDiagram';

const PfdLayout = ({ allData }) => {
  // 장치 번호순 정렬
  const sortedIds = Object.keys(allData).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'operating' || s === 'normal') return { bg: '#2ecc71', label: 'OPERATING' }; 
    if (s === 'warning') return { bg: '#f1c40f', label: 'WARNING' };                   
    if (s === 'error' || s === 'danger') return { bg: '#e74c3c', label: 'ERROR' };      
    return { bg: '#95a5a6', label: 'IDLE' };
  };

  if (sortedIds.length === 0) return <div className="loading">장치 연결 대기 중...</div>;

  return (
    <div className="pfd-clean-container" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #2d3748', paddingBottom: '10px' }}>
        <h2 style={{ color: '#2d3748', margin: 0 }}>Process Flow Diagram </h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {sortedIds.map(id => {
          const data = allData[id];
          const statusStyle = getStatusStyle(data.status);
          
          return (
            <section key={id} style={{ 
              background: '#fff', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#1a202c', fontSize: '20px' }}>{id}</h3>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold', 
                  background: statusStyle.bg, color: '#fff' 
                }}>
                  ● {statusStyle.label}
                </span>
              </div>

              {/* PFD 화면 영역 */}
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                <ProcessFlowDiagram data={data} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default PfdLayout;