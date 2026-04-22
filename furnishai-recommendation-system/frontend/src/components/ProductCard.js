import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Tag, DollarSign, Globe, Palette, Package } from 'lucide-react';

export default function ProductCard({ recommendation }) {
  const { product, score, generated_description, category_label } = recommendation;
  const [imgErr, setImgErr] = useState(false);
  const navigate = useNavigate();

  const imgUrl = product.first_image || '';
  const matchPct = Math.round((score || 0) * 100);
  const scoreColor =
    score > 0.75 ? '#2a7d46' : score > 0.5 ? '#8b5e3c' : '#999';

  return (
    <div
      className="fade-up"
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eeece8',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image ── */}
<div
  onClick={() =>
    navigate(`/product/${product.uniq_id}`, { state: product })
  }
  style={{
    position: 'relative',
    height: 190,
    background: '#f9f8f6',
    overflow: 'hidden',
    flexShrink: 0,
    cursor: 'pointer'
  }}
>
  {imgUrl && !imgErr ? (
    <img
      src={imgUrl}
      alt={product.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setImgErr(true)}
    />
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Package size={36} color="#ddd" />
    </div>
  )}

  {/* Category badge */}
  <span style={{ position:'absolute', top:9, left:9, fontSize:11, padding:'3px 9px', borderRadius:20, background:'#f0ede8', color:'#8b5e3c' }}>
    {category_label || product.leaf_category || 'Home'}
  </span>

  {/* Score */}
  <span style={{ position:'absolute', top:9, right:9, fontSize:11, padding:'3px 9px', borderRadius:20, background:'#fff', color:scoreColor }}>
    {matchPct}%
  </span>
</div>
      {/* ── Body ── */}
      <div
        style={{
          padding: '12px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          flex: 1,
        }}
      >
        {product.brand && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#8b5e3c',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {product.brand}
          </div>
        )}

        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.title}
        </h3>

        {/* AI description */}
        <p
          style={{
            fontSize: 12,
            color: '#777',
            lineHeight: 1.55,
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {generated_description}
        </p>

        {/* Meta chips */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}
        >
          {product.price > 0 && (
            <Chip icon={<DollarSign size={10} />} label={`$${product.price.toFixed(2)}`} />
          )}
          {product.color && product.color !== 'nan' && product.color !== '' && (
            <Chip icon={<Palette size={10} />} label={product.color} />
          )}
          {product.material &&
            product.material !== 'nan' &&
            product.material !== '' && (
              <Chip icon={<Tag size={10} />} label={product.material} />
            )}
          {product.country_of_origin &&
            product.country_of_origin !== 'nan' &&
            product.country_of_origin !== '' && (
              <Chip icon={<Globe size={10} />} label={product.country_of_origin} />
            )}
        </div>

        {product.package_dimensions &&
          product.package_dimensions !== 'nan' &&
          product.package_dimensions !== '' && (
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
              📦 {product.package_dimensions}
            </div>
          )}
      </div>
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        color: '#555',
        background: '#f5f4f1',
        borderRadius: 20,
        padding: '3px 8px',
        maxWidth: 150,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {icon}
      {String(label).slice(0, 25)}
    </span>
  );
}
