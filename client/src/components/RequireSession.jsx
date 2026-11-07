import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

export default function RequireSession({ children, role }) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    getCurrentUser().then(({ data }) => {
      if (!active) return;
      localStorage.setItem('nexus_user', JSON.stringify(data));
      setResult({ role, allowed: data.role === role });
    }).catch(() => { if (active) setResult({ role, allowed: false }); });
    return () => { active = false; };
  }, [role]);
  if (!result || result.role !== role) return <p role="status">Checking your session...</p>;
  if (!result.allowed) return <Navigate to="/login" replace />;
  return children;
}
