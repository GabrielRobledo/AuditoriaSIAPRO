const KpiCard = ({ icon: Icon, title, value, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        flex: '1 1 200px',
        borderLeft: `5px solid ${color}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        ...(onClick && { ':hover': { transform: 'scale(1.01)' } })
      }}
    >
      <div>
        <Icon size={32} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '14px', color: '#888' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
      </div>
    </div>
  );
};

export default KpiCard;