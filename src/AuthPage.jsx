import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  Briefcase
} from 'lucide-react';

const CREDENTIALS = [
  { email: 'shraddha@gmail.com', password: 'admin@123', role: 'admin' },
  { email: 'shraddhaakolkar@gmail.com', password: 'shraddha@123', role: 'project_manager' },
  { email: 'employee@example.com', password: 'employee@123', role: 'employee' }
];

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [orgName, setOrgName] = useState('');

  // Mock auto-detected role
  const [detectedRole, setDetectedRole] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  // Simulate role detection based on email/tenant
  useEffect(() => {
    if (isLogin && email.length > 5 && tenantId.length > 2) {
      setIsDetecting(true);
      const timer = setTimeout(() => {
        setIsDetecting(false);
        const e = email.toLowerCase();
        if (e === 'shraddha@gmail.com' || e.includes('admin')) setDetectedRole('Admin');
        else if (e === 'shraddhaakolkar@gmail.com' || e.includes('manager')) setDetectedRole('Project Manager');
        else setDetectedRole('Employee');
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setDetectedRole('');
    }
  }, [email, tenantId, isLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      const match = CREDENTIALS.find(c => c.email === email && c.password === password);
      
      if (match) {
        const route = match.role === 'admin' ? '/admin-dashboard' 
                    : match.role === 'project_manager' ? '/manager-dashboard' 
                    : '/employee-dashboard';
        window.history.pushState({}, '', route);
        localStorage.setItem('role', match.role);
        onLogin({ tenantId, email, role: match.role });
      } else {
        setErrorMsg('Invalid email or password');
      }
    } else {
      if (isCreatingOrg) {
        onLogin({ tenantId: orgName.toLowerCase().replace(/\s+/g, '-'), email, role: 'admin' });
      } else {
        onLogin({ tenantId, email, role });
      }
    }
  };

  const renderLogin = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Organization / Tenant ID</label>
        <div className="input-wrapper">
          <Building2 className="input-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. acme-corp"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-wrapper">
          <Mail className="input-icon" />
          <input 
            type="email" 
            className="form-input" 
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" />
          <input 
            type="password" 
            className="form-input" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {email && tenantId && (
        <div className="form-group">
          <label className="form-label">Role (Auto-detected)</label>
          <div className={`role-badge ${isDetecting ? 'detecting' : ''}`}>
            <ShieldCheck size={16} />
            {isDetecting ? 'Detecting access level...' : detectedRole}
          </div>
        </div>
      )}

      <div className="options-row">
        <label className="checkbox-label">
          <input type="checkbox" className="checkbox-input" />
          Remember Me
        </label>
        <a href="#" className="link">Forgot Password?</a>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <button type="submit" className="btn-primary">
        Sign In <ArrowRight size={18} />
      </button>
    </form>
  );

  const renderRegister = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      {!isCreatingOrg ? (
        <div className="form-group">
          <label className="form-label">Organization / Tenant ID</label>
          <div className="input-wrapper">
            <Building2 className="input-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter your workspace ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            />
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label">Organization Name</label>
          <div className="input-wrapper">
            <Briefcase className="input-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Acme Corporation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div className="input-wrapper">
          <User className="input-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-wrapper">
          <Mail className="input-icon" />
          <input 
            type="email" 
            className="form-input" 
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" />
          <input 
            type="password" 
            className="form-input" 
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" />
          <input 
            type="password" 
            className="form-input" 
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {!isCreatingOrg && (
        <div className="form-group">
          <label className="form-label">Select Role</label>
          <div className="input-wrapper select-wrapper">
            <ShieldCheck className="input-icon" />
            <select 
              className="form-select" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="project_manager">Project Manager</option>
            </select>
          </div>
        </div>
      )}

      {isCreatingOrg && (
        <div className="form-group">
          <label className="form-label">Role</label>
          <div className="role-badge">
            <ShieldCheck size={16} />
            Organization Admin (Auto-assigned)
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary">
        {isCreatingOrg ? 'Create Organization & Account' : 'Create Account'} <UserPlus size={18} />
      </button>

      {!isLogin && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            type="button" 
            className="toggle-mode" 
            onClick={() => setIsCreatingOrg(!isCreatingOrg)}
            style={{ fontSize: '0.85rem' }}
          >
            {isCreatingOrg 
              ? 'Join an existing workspace instead' 
              : 'Want to create a new organization?'}
          </button>
        </div>
      )}
    </form>
  );

  return (
    <div className="auth-container">
      <div className="tabs">
        <div 
          className={`tab ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Sign In
        </div>
        <div 
          className={`tab ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </div>
      </div>

      <div className="auth-header">
        <h1 className="auth-title">
          {isLogin 
            ? 'Sign in to your account' 
            : (isCreatingOrg ? 'Setup your organization' : 'Create your account')}
        </h1>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Access your organization’s workspace securely' 
            : (isCreatingOrg ? 'Create a workspace and initial admin account' : 'Join your organization’s workspace')}
        </p>
      </div>

      {isLogin ? renderLogin() : renderRegister()}

      <div className="auth-footer">
        {isLogin ? (
          <p>
            Don't have an account? 
            <button className="toggle-mode" onClick={() => setIsLogin(false)}>
              Sign up now
            </button>
          </p>
        ) : (
          <p>
            Already have an account? 
            <button className="toggle-mode" onClick={() => setIsLogin(true)}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
