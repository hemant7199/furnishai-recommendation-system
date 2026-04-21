import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sofa, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    background: active ? '#f0ede8' : 'transparent',
    color: active ? '#8b5e3c' : '#666',
    transition: 'all 0.15s',
    cursor: 'pointer',
  });

  return (
    <nav
      style={{
        background: '#fff',
        borderBottom: '1px solid #eee',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 62,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.3px',
          color: '#1a1a1a',
        }}
      >
        <Sofa size={22} color="#8b5e3c" />
        FurnishAI
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#bbb',
            marginLeft: 2,
            background: '#f5f4f1',
            padding: '2px 7px',
            borderRadius: 20,
          }}
        >
        
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <Link to="/" style={linkStyle(pathname === '/')}>
          <Sofa size={15} /> Recommend
        </Link>
        <Link to="/analytics" style={linkStyle(pathname === '/analytics')}>
          <BarChart2 size={15} /> Analytics
        </Link>
      </div>
    </nav>
  );
}
