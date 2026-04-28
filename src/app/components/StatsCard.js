"use client";

export default function StatsCard({ title, value, icon, trend }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ 
        width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
        background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        {trend && (
          <div style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
            {trend} from last month
          </div>
        )}
      </div>
    </div>
  );
}
