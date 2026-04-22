import React, { useState, useRef, useEffect } from 'react';
import { Send, Sofa, Loader, Sparkles, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import ProductCard from '../components/ProductCard';

// Suggestions drawn from real ikarus leaf categories
const SUGGESTIONS = [
  'I need a comfortable ottoman for my living room',
  'Show me bar stools under $100',
  'Modern end table with storage',
  'Ergonomic home office desk chair',
  'Wall-mounted mirror for hallway',
  'Bean bag chair for kids room',
  'Doormat for outdoor entrance',
  'Black metal towel bar for bathroom',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(history, 6);
      setMessages([
        ...history,
        {
          role: 'assistant',
          content: data.reply,
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (err) {
      setMessages([
        ...history,
        {
          role: 'assistant',
          content:
            'Sorry, I could not fetch recommendations. Is the backend running on port 8000?',
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 62px)', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 236,
          borderRight: '1px solid #eee',
          background: '#fff',
          padding: '18px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#bbb',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}
        >
          <Sparkles size={12} color="#8b5e3c" />
          Try asking…
        </div>

        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            style={{
              background: '#f8f7f4',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: '8px 11px',
              fontSize: 12,
              color: '#444',
              cursor: 'pointer',
              textAlign: 'left',
              lineHeight: 1.4,
            }}
          >
            {s}
          </button>
        ))}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <button
            onClick={() => { setMessages([]); setInput(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: '#888',
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            <RefreshCw size={12} /> New chat
          </button>
          <p style={{ fontSize: 11, color: '#ccc', lineHeight: 1.5 }}>
            Semantic search over products · GPT-generated descriptions
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 30px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.length === 0 && !loading && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
                textAlign: 'center',
              }}
            >
              <Sofa size={52} color="#ddd" />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', marginTop: 18 }}>
                Find your perfect furniture
              </h2>
              <p style={{ color: '#aaa', fontSize: 14, marginTop: 8, maxWidth: 340 }}>
                Describe what you're looking for and I'll search 312 home & furniture products.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div
                  style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}
                >
                  <div
                    style={{
                      background: '#8b5e3c',
                      color: '#fff',
                      borderRadius: '16px 16px 4px 16px',
                      padding: '10px 16px',
                      fontSize: 14,
                      maxWidth: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #eee',
                      borderRadius: '4px 16px 16px 16px',
                      padding: '12px 16px',
                      maxWidth: 580,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#8b5e3c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <Sparkles size={11} /> FurnishAI
                    </span>
                    <p style={{ fontSize: 14, color: '#333', lineHeight: 1.65 }}>
                      {msg.content}
                    </p>
                  </div>

                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {msg.recommendations.map((rec, j) => (
                        <ProductCard key={j} recommendation={rec} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '12px 16px',
                  maxWidth: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#8b5e3c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Sparkles size={11} /> FurnishAI
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#bbb' }}>
                  <Loader size={14} className="spin" />
                  <span style={{ fontSize: 13 }}>Searching 312 products…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: '14px 30px 18px',
            borderTop: '1px solid #eee',
            background: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              background: '#f8f7f4',
              border: '1px solid #e0ddd8',
              borderRadius: 12,
              padding: '9px 13px',
            }}
          >
            <textarea
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#1a1a1a',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                maxHeight: 120,
              }}
              value={input}
              rows={1}
              disabled={loading}
              placeholder="Describe the furniture you're looking for…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              style={{
                background: '#8b5e3c',
                border: 'none',
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                flexShrink: 0,
                opacity: !input.trim() || loading ? 0.35 : 1,
              }}
              disabled={!input.trim() || loading}
              onClick={() => handleSend()}
            >
              <Send size={16} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 7 }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
