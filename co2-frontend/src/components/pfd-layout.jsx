import React from 'react';

// --- 1. 시각화 조각 (DetailedPFD) ---
const DetailedPFD = ({ data }) => {
  const getCol = (val, type) => {
    const limits = {
      input_ppm: { warn: 145000, err: 160000 },
      output_ppm: { warn: 20000, err: 30000 }, 
      efficiency: { warn: 90, err: 85, reverse: true },
      temp: { warn: 50, err: 60 },
      pressure: { warn: 1.1, err: 1.2 },
      energy_cons: { warn: 0.4, err: 0.5 }
    };
    const limit = limits[type];
    if (!limit || val === undefined) return '#4A5568';
    if (limit.reverse ? val < limit.err : val > limit.err) return '#E53E3E';
    if (limit.reverse ? val < limit.warn : val > limit.warn) return '#F6AD55';
    return '#38A169';
  };

  const cols = {
    in: getCol(data.input_ppm, 'input_ppm'),
    out: getCol(data.output_ppm, 'output_ppm'), // 아웃풋 전용 로직 적용
    pre: getCol(data.pressure, 'pressure'),
    temp: getCol(data.temp, 'temp'),
    eff: getCol(data.efficiency, 'efficiency'),
    ene: getCol(data.energy_cons, 'energy_cons'),
  };

  const pipeStyle = (color) => ({
    stroke: color, strokeWidth: 4, fill: 'none', transition: 'stroke 0.3s ease',
    strokeDasharray: '10, 5', animation: 'flowAnim 2s linear infinite',
    strokeLinecap: 'round', strokeLinejoin: 'round'
  });

  return (
    <div style={{ background: '#0f172a', padding: '30px', borderRadius: '10px' }}>
      <style>{`
        @keyframes flowAnim { to { stroke-dashoffset: -15; } }
        .tower-body { fill: #1e293b; stroke: #64748b; stroke-width: 2; }
        .packing { stroke: #334155; stroke-width: 1; }
        .title-text { font-size: 15px; font-weight: bold; fill: #f1f5f9; }
        .info-label { font-size: 11px; fill: #f1f5f9; font-weight: 500; }
        .info-val { font-size: 13px; font-weight: 800; }
      `}</style>

      <svg width="100%" height="400" viewBox="0 0 1000 400">
        {/* [Layer 1] 장치 본체 및 테두리 */}
        <rect x="150" y="80" width="130" height="240" rx="10" className="tower-body" />
        <rect x="580" y="80" width="130" height="240" rx="10" className="tower-body" />
        <circle cx="420" cy="180" r="30" className="tower-body" />  
        
        {/* [Layer 2] 모든 배관 (선) */}
        <path d="M 20,280 L 150,280" style={pipeStyle(cols.in)} />
        <path d="M 215,80 L 215,40" style={pipeStyle(cols.out)} />
        <path d="M 215,40 L 950,40" style={pipeStyle(cols.out)} /> 
        <path d="M 870,40 L 870,140" style={pipeStyle(cols.out)} />
        <path d="M 280,280 L 420,280 L 420,220" style={pipeStyle(cols.temp)} />
        <path d="M 420,150 L 420,100 L 580,100" style={pipeStyle(cols.temp)} />

        {/* [Layer 3] 모든 텍스트 및 라벨 (배관보다 위에 그려짐) */}
        <text x="215" y="65" textAnchor="middle" className="title-text">흡수탑 (Absorber)</text>
        <text x="645" y="65" textAnchor="middle" className="title-text">재생탑 (Regenerator)</text>
        <text x="420" y="175" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold">열 교환기</text>
        <text x="420" y="195" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold">H/X</text>

        <text x="20" y="245" className="info-label">가스 유입 (input_ppm)</text>
        <text x="20" y="265" className="info-val" fill={cols.in}>{data.input_ppm?.toLocaleString()} ppm</text>
        
        <text x="215" y="190" textAnchor="middle" className="info-label">압력 (pressure)</text>
        <text x="215" y="215" textAnchor="middle" className="info-val" fill={cols.pre}>{data.pressure} bar</text>

        <text x="1060" y="35" textAnchor="end" className="info-label" fill={cols.out}>정제가스 (output_ppm)</text>
        <text x="1020" y="55" textAnchor="end" className="info-val" fill={cols.out}>{data.output_ppm?.toLocaleString()} ppm</text>

        <text x="460" y="175" className="info-label">온도 (temp)</text>
        <text x="460" y="195" className="info-val" fill={cols.temp}>{data.temp} °C</text>

        <text x="645" y="190" textAnchor="middle" className="info-label">단위 생산당 에너지 소비량</text>
        <text x="645" y="210" textAnchor="middle" className="info-label">(energy_cons)</text>
        <text x="645" y="235" textAnchor="middle" className="info-val" fill={cols.ene}>{data.energy_cons} MWh/t</text>

        {/* 효율 요약 박스 */}
        <rect x="780" y="140" width="180" height="110" rx="12" fill="#1e293b" stroke={cols.eff} strokeWidth="3" />
        <text x="870" y="175" textAnchor="middle" className="info-label" fill={cols.eff}>포집 효율 (efficiency)</text>
        <text x="870" y="215" textAnchor="middle" style={{fontSize: '32px', fontWeight: '900'}} fill={cols.eff}>
          {data.efficiency}%
        </text>

        <text x="960" y="380" textAnchor="end" fill="#f1f5f9" fontSize="11">가동시간: {data.runtime}s</text>
      </svg>
    </div>
  );
};

// --- 2. 메인 화면 구성 (PfdLayout) ---
const PfdLayout = ({ allData }) => {
  const sortedIds = Object.keys(allData).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true })
  );

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'operating' || s === 'normal') return { bg: '#38A169', label: 'OPERATING' }; 
    if (s === 'warning') return { bg: '#f1c40f', label: 'WARNING' };                   
    return { bg: '#e74c3c', label: 'ERROR' };      
  };

  return (
    <div style={{ padding: '20px', background: '#f1f5f9', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', borderBottom: '3px solid #1e293b', paddingBottom: '10px' }}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>실시간 공정 모니터링 시스템</h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {sortedIds.map(id => (
          <section key={id} style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{id}</h3>
              <span style={{ padding: '2px 10px', borderRadius: '10px', background: getStatusStyle(allData[id].status).bg, color: '#fff', fontSize: '10px' }}>
                ● {getStatusStyle(allData[id].status).label}
              </span>
            </div>
            {/* 위에서 만든 시각화 조각을 여기서 사용합니다 */}
            <DetailedPFD data={allData[id]} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default PfdLayout;