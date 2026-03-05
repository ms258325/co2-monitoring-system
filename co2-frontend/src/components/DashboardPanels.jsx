import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// 농도 차트: deviceId를 받아 고유한 Gradient ID 생성
export const ConcentrationChart = ({ history, deviceId }) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={history}>
      <defs>
        <linearGradient id={`colorInput-${deviceId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
      <XAxis dataKey="time" hide />
      <YAxis stroke="#888" domain={[0, 160000]} />
      <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
      <Area type="monotone" dataKey="input_ppm" stroke="#3498db" fill={`url(#colorInput-${deviceId})`} isAnimationActive={false} />
      <Area type="monotone" dataKey="output_ppm" stroke="#2ecc71" fill="#2ecc71" fillOpacity={0.1} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer>
);

export const EfficiencyGauge = ({ value }) => {
  const data = [{ value: value }, { value: 100 - value }];
  return (
    <ResponsiveContainer width="100%" height={150}>
      <PieChart>
        <Pie data={data} innerRadius={50} outerRadius={70} startAngle={180} endAngle={0} dataKey="value" isAnimationActive={false}>
          <Cell fill="#2ecc71" />
          <Cell fill="#333" />
        </Pie>
        <text x="50%" y="60%" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">{value}%</text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const EnergyBar = ({ history, deviceId }) => (
  <ResponsiveContainer width="100%" height={100}>
    <AreaChart data={history}>
      <defs>
        <linearGradient id={`colorEnergy-${deviceId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f39c12" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#f39c12" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
      <XAxis dataKey="time" hide />
      <YAxis hide domain={[0, 0.6]} /> 
      <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} itemStyle={{ color: '#f39c12' }} />
      <Area type="monotone" dataKey="energy_cons" stroke="#f39c12" fill={`url(#colorEnergy-${deviceId})`} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// 통합 패널 컴포넌트
const DashboardPanels = ({ deviceId, data, history }) => {
  const calcEff = data.input_ppm > 0 
    ? ((data.input_ppm - data.output_ppm) / data.input_ppm * 100) 
    : 0;

  return (
    <div className="dashboard-grid">
      <section className="panel">
        <label>CAPTURE EFFICIENCY</label>
        {/* [수정] 계산된 값을 전달 (소수점 1자리) */}
        <EfficiencyGauge value={parseFloat(calcEff.toFixed(1))} />
      </section>

      <section className="panel">
        <label>PROCESS ENVIRONMENT</label>
        <div className="stat-group">
          <div className="stat-item">
            <span className="label">Temp</span>
            <span className="value">{data.temp} <small>°C</small></span>
          </div>
          <div className="stat-item">
            <span className="label">Pressure</span>
            <span className="value">{data.pressure} <small>bar</small></span>
          </div>
        </div>
      </section>

      <section className="panel chart-wide">
        <label>ENERGY CONSUMPTION</label>
        <div className="energy-val" style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
          {data.energy_cons} <small>MWh/ton</small>
        </div>
        <EnergyBar history={history} deviceId={deviceId} />
      </section>

      <section className="panel chart-full">
        <label>CO2 CONCENTRATION TREND (PPM)</label>
        <ConcentrationChart history={history} deviceId={deviceId} />
        <div className="chart-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Input: {data.input_ppm?.toLocaleString()}</span>
          <span style={{color: '#2ecc71'}}>Output: {data.output_ppm?.toLocaleString()}</span>
        </div>
      </section>

      <section className="panel">
        <label>SYSTEM STATUS</label>
        <div className="runtime-box">
          <p>Runtime: <strong>{data.runtime}</strong>s</p>
          <p>Flow Rate: <strong>{data.flow_rate}</strong> m³/h</p>
        </div>
      </section>
    </div>
  );
};

export default DashboardPanels;