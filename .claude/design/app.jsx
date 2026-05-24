// app.jsx — 모바일 웹 청첩장 (no device frame)

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#E8E2D6',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: '#FAF7F2',
        position: 'relative',
        minHeight: '100vh',
        boxShadow: '0 0 60px rgba(0,0,0,0.06)',
      }}>
        <WeddingInvite />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
