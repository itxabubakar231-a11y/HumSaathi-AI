export default function ShapeVisual({ shape, color }) {
  const colorMap = {
    blue: '#6b9bd1',
    red: '#d17a6b',
    green: '#739e92',
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
