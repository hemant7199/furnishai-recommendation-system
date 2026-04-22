import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Package, Award, DollarSign, Tag, Search, Loader,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getAnalyticsSummary, getProducts } from '../services/api';

const PAL = [
  '#8b5e3c','#c4956a','#a0784d','#d4b896','#6b4423',
  '#e8d5c0','#b8895e','#7a5230','#f0e4d4','#ddc4a8',
];

function Box({ title, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: '#333' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee',
      borderRadius: 12, padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#f5f4f1', border: '1px solid #eee', borderRadius: 6,
        padding: '5px 11px', fontSize: 12,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#ccc' : '#555',
      }}
    >
      {children}
    </button>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary]         = useState(null);
  const [products, setProducts]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loadingSum, setLoadingSum]   = useState(true);
  const [loadingTbl, setLoadingTbl]   = useState(false);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoadingSum(false));
  }, []);

  useEffect(() => {
    setLoadingTbl(true);
    getProducts(page, 20, search)
      .then((d) => { setProducts(d.products || []); setTotal(d.total || 0); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoadingTbl(false));
  }, [page, search]);

  const doSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (loadingSum) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', gap: 12, color: '#bbb',
      }}>
        <Loader size={18} className="spin" /> Loading analytics...
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: 40, color: '#aaa' }}>
        Could not load data. Make sure the backend is running on port 8000
        and <code>intern_data_ikarus.csv</code> is in <code>backend/data/</code>.
      </div>
    );
  }

  const catData   = summary.top_categories.map((c) => ({ name: c.name || 'Other', value: c.count }));
  const brandData = summary.brand_counts.slice(0, 8).map((b) => ({ name: b.name || '?', value: b.count }));
  const colorData = summary.color_counts.slice(0, 10).map((c) => ({ name: c.name || '?', value: c.count }));
  const priceData = Object.entries(summary.price_distribution).map(([k, v]) => ({ range: k, count: v }));
  const matData   = summary.material_counts.slice(0, 8).map((m) => ({ name: m.name || '?', value: m.count }));

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1180, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dataset Analytics</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
        </p>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 16,
      }}>
        <MetricCard icon={<Package size={17} color="#8b5e3c" />}   label="Products"      value={summary.total_products.toLocaleString()} />
        <MetricCard icon={<Award size={17} color="#8b5e3c" />}      label="Unique Brands" value={summary.unique_brands.toLocaleString()} />
        <MetricCard icon={<DollarSign size={17} color="#8b5e3c" />} label="Avg Price"     value={'$' + summary.avg_price.toFixed(2)} />
        <MetricCard icon={<Tag size={17} color="#8b5e3c" />}        label="Price Range"   value={'$' + summary.price_range.min + ' – $' + summary.price_range.max} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Box title="Top Categories">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={138} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box title="Top Brands">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={brandData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={82}
                label={({ name }) => name.slice(0, 14)}
              >
                {brandData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Box title="Price Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priceData}>
              <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-18} textAnchor="end" height={46} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#c4956a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box title="Top Colors">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={colorData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-18} textAnchor="end" height={46} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" fill="#a0784d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>

      {/* Materials chart */}
      <div style={{ marginBottom: 12 }}>
        <Box title="Top Materials">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={matData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" fill="#d4b896" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>

      {/* Products Table */}
      <div style={{
        background: '#fff', border: '1px solid #eee',
        borderRadius: 12, padding: '20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>
            All Products ({total})
          </h2>
          <form onSubmit={doSearch} style={{ display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#f5f4f1', borderRadius: 8,
              padding: '6px 12px', border: '1px solid #eee',
            }}>
              <Search size={13} color="#bbb" />
              <input
                style={{
                  border: 'none', background: 'transparent',
                  fontSize: 13, outline: 'none', width: 200,
                }}
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#8b5e3c', color: '#fff', border: 'none',
                borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
              }}
            >
              Search
            </button>
          </form>
        </div>

        {loadingTbl ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ccc' }}>
            <Loader size={16} className="spin" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8f7f4' }}>
                  {['Image', 'Title', 'Brand', 'Price', 'Category', 'Color', 'Material', 'Origin'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 11px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: '#666',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f4f3f0' }}>
                    <td style={{ padding: '8px 11px', width: 50 }}>
                      {p.first_image ? (
                        <img
                          src={p.first_image} alt=""
                          style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 42, height: 42, background: '#f0f0f0', borderRadius: 6 }} />
                      )}
                    </td>
                    <td style={{ padding: '8px 11px', maxWidth: 220 }}>
                      <span style={{ fontWeight: 500 }}>
                        {String(p.title || '').slice(0, 55)}
                        {String(p.title || '').length > 55 ? '...' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>{p.brand || '—'}</td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>
                      {p.price > 0 ? '$' + Number(p.price).toFixed(2) : '—'}
                    </td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>{p.leaf_category || '—'}</td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>{p.color || '—'}</td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>{p.material || '—'}</td>
                    <td style={{ padding: '8px 11px', color: '#444' }}>{p.country_of_origin || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginTop: 14,
        }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>
            {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <PageBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={13} /> Prev
            </PageBtn>
            <PageBtn disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={13} />
            </PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
