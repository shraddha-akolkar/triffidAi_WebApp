import React, { useState } from 'react';
import { 
  LayoutDashboard, FileCode2, BookOpen, Database, 
  Globe, Rocket, GitBranch, LayoutTemplate, 
  Calculator, Cloud, Users, UserCog, Settings, 
  Building, LogOut, ShieldAlert, Lock
} from 'lucide-react';
import CICDPipeline from './CICDPipeline';
import './dashboard.css';

const MODULES = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  codeGen: { id: 'codeGen', label: 'AI Code Generator', icon: FileCode2 },
  docs: { id: 'docs', label: 'Documentation', icon: BookOpen },
  database: { id: 'database', label: 'Database Management', icon: Database },
  api: { id: 'api', label: 'API Management', icon: Globe },
  deploy: { id: 'deploy', label: 'Deployment', icon: Rocket },
  cicd: { id: 'cicd', label: 'CI/CD Pipeline', icon: GitBranch },
  visual: { id: 'visual', label: 'Visual Builder', icon: LayoutTemplate },
  cost: { id: 'cost', label: 'AI Cost Estimator', icon: Calculator },
  cloud: { id: 'cloud', label: 'Cloud Overview', icon: Cloud },
  users: { id: 'users', label: 'User Management', icon: Users },
  roles: { id: 'roles', label: 'Role Management', icon: UserCog },
  settings: { id: 'settings', label: 'System Settings', icon: Settings },
  orgs: { id: 'orgs', label: 'Organization Management', icon: Building },
};

// Define restrictions mapping
const ROLE_ACCESS = {
  employee: ['dashboard', 'codeGen', 'docs'],
  project_manager: [
    'dashboard', 'codeGen', 'docs', 'database', 'api', 
    'deploy', 'cicd', 'visual', 'cost', 'cloud'
  ],
  admin: Object.keys(MODULES), // all modules
};

const Dashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const allowedModules = ROLE_ACCESS[user.role.toLowerCase()] || [];

  const handleNavClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  const hasAccess = (moduleId) => allowedModules.includes(moduleId);

  const renderSidebarItem = (moduleId) => {
    if (!hasAccess(moduleId)) return null;
    const mod = MODULES[moduleId];
    const Icon = mod.icon;
    return (
      <div 
        key={moduleId}
        className={`nav-item ${activeModule === moduleId ? 'active' : ''}`}
        onClick={() => handleNavClick(moduleId)}
      >
        <Icon className="nav-item-icon" />
        {mod.label}
      </div>
    );
  };

  const renderModuleContent = () => {
    if (!hasAccess(activeModule)) {
      return (
        <div className="access-denied">
          <ShieldAlert />
          <h2>Access Denied</h2>
          <p>Your current role ({user.role}) does not have permission to view this module.</p>
        </div>
      );
    }

    const mod = MODULES[activeModule];

    if (activeModule === 'cicd') {
      return (
        <div className="module-content">
          <div className="module-header">
            <h1 className="module-title">{mod.label}</h1>
            <p className="module-desc">
              Displaying isolated data for organization: <strong>{user.tenantId}</strong>
            </p>
          </div>
          <div className="data-isolation-warning" style={{ marginBottom: '1.5rem' }}>
            <Lock size={20} />
            <div>
              <strong>Strict Data Isolation Enforced</strong>
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                All backend queries are automatically appending <code>WHERE tenant_id = '{user.tenantId}'</code> to ensure you cannot access cross-tenant data. 
              </p>
            </div>
          </div>
          <CICDPipeline />
        </div>
      );
    }

    return (
      <div className="module-content">
        <div className="module-header">
          <h1 className="module-title">{mod.label}</h1>
          <p className="module-desc">
            Displaying isolated data for organization: <strong>{user.tenantId}</strong>
          </p>
        </div>

        <div className="data-isolation-warning">
          <Lock size={20} />
          <div>
            <strong>Strict Data Isolation Enforced</strong>
            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
              All backend queries are automatically appending <code>WHERE tenant_id = '{user.tenantId}'</code> to ensure you cannot access cross-tenant data. 
              {activeModule === 'dashboard' && user.role === 'employee' ? ' (Limited View Enabled)' : ''}
            </p>
          </div>
        </div>

        <div className="grid-cards">
          <div className="card">
            <div className="card-title">Active Resources</div>
            <div className="card-value">1,024</div>
          </div>
          <div className="card">
            <div className="card-title">Tenant Compute</div>
            <div className="card-value">45%</div>
          </div>
          <div className="card">
            <div className="card-title">Access Level</div>
            <div className="card-value" style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>
              <span className={`role-tag role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {['users', 'database'].includes(activeModule) && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Data Table (Isolated View)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Tenant Identifier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#001</td>
                  <td>Project Alpha Container</td>
                  <td>{user.tenantId}</td>
                  <td><span style={{ color: 'var(--secondary)' }}>Active</span></td>
                </tr>
                <tr>
                  <td>#002</td>
                  <td>API Gateway Config</td>
                  <td>{user.tenantId}</td>
                  <td><span style={{ color: 'var(--secondary)' }}>Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          TriffidAI
          <span className="tenant-badge">{user.tenantId}</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">General</div>
            {renderSidebarItem('dashboard')}
            {renderSidebarItem('codeGen')}
            {renderSidebarItem('docs')}
          </div>

          {(user.role === 'admin' || user.role === 'project_manager') && (
            <div className="nav-section">
              <div className="nav-section-title">Engineering</div>
              {renderSidebarItem('database')}
              {renderSidebarItem('api')}
              {renderSidebarItem('deploy')}
              {renderSidebarItem('cicd')}
              {renderSidebarItem('visual')}
            </div>
          )}

          {(user.role === 'admin' || user.role === 'project_manager') && (
            <div className="nav-section">
              <div className="nav-section-title">Operations</div>
              {renderSidebarItem('cloud')}
              {renderSidebarItem('cost')}
            </div>
          )}

          {user.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-section-title">Administration</div>
              {renderSidebarItem('users')}
              {renderSidebarItem('roles')}
              {renderSidebarItem('settings')}
              {renderSidebarItem('orgs')}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-role">{user.role.replace('_', ' ')}</span>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="topbar">
          <div className="topbar-title">{MODULES[activeModule]?.label || 'Module'}</div>
          <div className="security-badge">
            <ShieldAlert size={16} /> Secure Context
          </div>
        </header>
        <div className="main-area">
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
