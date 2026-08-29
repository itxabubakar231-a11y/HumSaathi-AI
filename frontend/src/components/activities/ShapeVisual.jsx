export default function ShapeVisual({ shape, color }) {
  const colorMap = {
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#10b981',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    orange: '#f97316',
  };

  const fill = colorMap[color] || '#8c84a3';

  if (shape === 'circle') {
    return <div className="shape-visual circle" style={{ backgroundColor: fill }} aria-hidden="true" />;
  }
  if (shape === 'square') {
    return <div className="shape-visual square" style={{ backgroundColor: fill }} aria-hidden="true" />;
  }
  return (
    <div className="shape-visual triangle-wrap" aria-hidden="true">
      <div className="shape-visual triangle" style={{ borderBottomColor: fill }} />
    </div>
  );
}
