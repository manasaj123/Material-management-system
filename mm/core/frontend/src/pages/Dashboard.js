import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '25px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      padding: '40px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif"
    }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '40px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        📊 Material Management Dashboard
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        marginTop: '40px'
      }}>
        <Link to="/customers" style={cardStyle('rgba(168, 237, 234, 0.2)', '#a8edea', '👥', '#4facfe')}>
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '20px'
          }}>👥</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            color: '#2c3e50'
          }}>Customer Onboarding</h3>
          <p style={{
            fontSize: '0.95rem',
            color: '#7f8c8d',
            textAlign: 'center'
          }}>Manage customer data</p>
        </Link>

        <Link to="/farmers" style={cardStyle('rgba(255, 236, 210, 0.2)', '#ffecd2', '🌾', '#fcb69f')}>
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '20px'
          }}>🌾</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            color: '#2c3e50'
          }}>Farmer Onboarding</h3>
          <p style={{
            fontSize: '0.95rem',
            color: '#7f8c8d',
            textAlign: 'center'
          }}>Manage farmer data</p>
        </Link>

        
      </div>
    </div>
  );
}


const cardStyle = (bgColor, gradientBg, iconEmoji, topBorder) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: 'inherit',
  padding: '35px 25px',
  borderRadius: '20px',
  background: gradientBg,
  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  minHeight: '220px',
  borderTop: `4px solid ${topBorder}`,
  ':hover': {
    transform: 'translateY(-15px) scale(1.02)',
    boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
  }
});
