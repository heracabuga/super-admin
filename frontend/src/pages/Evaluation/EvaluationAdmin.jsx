import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// Ang Evaluation System ng Super Admin: pagpindot sa sidebar, diretso sa
// Dashboard ng Faculty Evaluation, naka-login na (single sign-on) kaya walang
// pangalawang login. Faculty Admin ang papasukan, kaya buo ang system:
// Dashboard, Edit Questionnaires, Evaluation Criteria, Classroom Observation
// at Evaluation Reports.
//
// .env ng frontend ng Super Admin:
//   VITE_FACULTY_EVAL_URL=http://localhost:5174
//
// Kailangan ding tumatakbo ang frontend at backend ng Faculty Evaluation, at
// may EVAL_SSO_SECRET sa backend ng Super Admin (at SSO_SHARED_SECRET sa backend
// ng Faculty Evaluation) na parehong halaga.
const EVAL_URL = (import.meta.env.VITE_FACULTY_EVAL_URL || 'http://localhost:5174').replace(/\/$/, '');

const EvaluationAdmin = () => {
  const [src, setSrc] = useState('');
  const [notice, setNotice] = useState('');

  // Bagong token tuwing bubuksan ang tab na ito. 60 segundo lang ang buhay
  // nito at isang beses lang magagamit.
  useEffect(() => {
    let cancelled = false;
    api.post('/admin/evaluation-sso', { role: 'faculty_admin' })
      .then((res) => {
        if (!cancelled) setSrc(`${EVAL_URL}/?sso=${encodeURIComponent(res.data.sso)}&embed=1`);
      })
      .catch((err) => {
        if (cancelled) return;
        // Kapag hindi gumana ang auto-login, ipakita pa rin ang login page ng
        // Faculty Evaluation para makapag-login nang mano-mano.
        const detail = err?.response?.data?.detail;
        setNotice(detail ? `Auto-login failed: ${detail}` : 'Auto-login failed. You can log in below.');
        setSrc(`${EVAL_URL}/?embed=1`);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 140px)' }}>
      {notice && (
        <div style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
          {notice}
        </div>
      )}

      {src ? (
        <iframe
          title="Faculty Evaluation System"
          src={src}
          style={{
            flex: 1, width: '100%', minHeight: 'calc(100vh - 160px)',
            border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
          }}
        />
      ) : (
        <p style={{ color: '#64748b', fontSize: 14 }}>Opening the Evaluation System...</p>
      )}
    </div>
  );
};

export default EvaluationAdmin;
