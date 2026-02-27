import React from 'react';

const ProcessFlowDiagram = ({ data }) => {
  const getLevelColor = (val, type) => {
    const limits = {
      input: { warn: 145000, err: 160000 },
      eff: { warn: 90, err: 85, reverse: true },
      temp: { warn: 50, err: 60 },
      pressure: { warn: 1.1, err: 1.2 },
      flow: { warn: 2550, err: 2650 },
      energy: { warn: 0.4, err: 0.5 }
    };
    const limit = limits[type];
    if (!limit) return '#2d3748';

    if (limit.reverse) {
      if (val < limit.err) return '#e53e3e';
      if (val < limit.warn) return '#f6ad55';
    } else {
      if (val > limit.err) return '#e53e3e';
      if (val > limit.warn) return '#f6ad55';
    }
    return '#2d3748';
  };

  const pipeStyle = (color) => ({
    stroke: color, strokeWidth: 6, fill: 'none', transition: 'stroke 0.4s ease', strokeLinecap: 'butt'
  });

  const inputCol = getLevelColor(data.input_ppm, 'input');
  const flowCol = getLevelColor(data.flow_rate, 'flow');
  const tempCol = getLevelColor(data.temp, 'temp');
  const effCol = getLevelColor(data.efficiency, 'eff');

  return (
    <svg width="100%" height="320" viewBox="0 0 900 320">
      <path d="M 50,110 L 188,110" style={pipeStyle(inputCol)} />
      <text x="50" y="95" fontSize="13" fontWeight="bold" fill={inputCol}>
        INLET: {data.input_ppm?.toLocaleString()} ppm
      </text>
      <polygon points="200,110 188,104 188,116" fill={inputCol} />

      <path d="M 50,210 L 188,210" style={pipeStyle(flowCol)} />
      <text x="50" y="195" fontSize="13" fontWeight="bold" fill={flowCol}>
        FLOW: {data.flow_rate?.toLocaleString()} m³/h
      </text>
      <polygon points="200,210 188,204 188,216" fill={flowCol} />

      <rect x="200" y="50" width="130" height="220" fill="#f8fafc" stroke="#2d3748" strokeWidth="2" />
      <text x="265" y="150" textAnchor="middle" fontWeight="bold" fontSize="16">흡수탑</text>
      <text x="265" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill={getLevelColor(data.pressure, 'pressure')}>
        {data.pressure} bar
      </text>

      <path d="M 330,160 L 458,160" style={pipeStyle(tempCol)} />
      <text x="400" y="150" textAnchor="middle" fontSize="13" fontWeight="bold" fill={tempCol}>
        {data.temp} °C
      </text>
      <polygon points="470,160 458,154 458,166" fill={tempCol} />

      <rect x="470" y="50" width="130" height="220" fill="#f8fafc" stroke="#2d3748" strokeWidth="2" />
      <text x="535" y="150" textAnchor="middle" fontWeight="bold" fontSize="16">재생탑</text>
      <text x="535" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill={getLevelColor(data.energy_cons, 'energy')}>
        {data.energy_cons} MWh/t
      </text>

      <path d="M 600,110 L 768,110" style={pipeStyle('#2d3748')} />
      <text x="620" y="95" fontSize="13" fontWeight="bold" fill="#2d3748">
        OUTLET: {data.output_ppm?.toLocaleString()} ppm
      </text>
      <polygon points="780,110 768,104 768,116" fill="#2d3748" />

      <path d="M 600,210 L 768,210" style={pipeStyle(effCol)} />
      <text x="620" y="195" fontSize="13" fontWeight="bold" fill={effCol}>
        EFFICIENCY: {data.efficiency}%
      </text>
      <polygon points="780,210 768,204 768,216" fill={effCol} />

      <text x="850" y="300" textAnchor="end" fontSize="11" fill="#2d3748">Runtime: {data.runtime}s</text>
    </svg>
  );
};

export default ProcessFlowDiagram;