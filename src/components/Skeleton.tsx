export function PlateSkeleton() {
  return (
    <div className="plate-card" style={{ cursor: 'default' }}>
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: 12
      }}>
        <div className="skeleton" style={{ width: 200, height: 56, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="skeleton" style={{ width: 120, height: 22, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
      </div>
      <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ padding: '10px 16px 0', textAlign: 'center' }}>
      <div className="skeleton" style={{
        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px'
      }} />
      <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 6, margin: '0 auto 8px' }} />
      <div className="skeleton" style={{ width: 100, height: 16, borderRadius: 6, margin: '0 auto 16px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[0,1,2].map(i => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="listing-item">
      <div className="skeleton" style={{ width: 100, height: 44, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
  );
}