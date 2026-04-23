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

const AVAILABLE_TECH = [
  { id: 'html-css', label: 'HTML + CSS', enabled: true },
  { id: 'react', label: 'React', enabled: false },
  { id: 'angular', label: 'Angular', enabled: false },
];

const Dashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [projectName, setProjectName] = useState('');
  const [selectedTech, setSelectedTech] = useState('html-css');
  const [buildPrompt, setBuildPrompt] = useState('');
  const [featurePrompt, setFeaturePrompt] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [generatedCss, setGeneratedCss] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const allowedModules = ROLE_ACCESS[user.role.toLowerCase()] || [];
  const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const handleNavClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  const hasAccess = (moduleId) => allowedModules.includes(moduleId);

  const getAssistantText = (responseJson) => {
    if (responseJson.output_text) return responseJson.output_text;
    if (!Array.isArray(responseJson.output)) return '';

    return responseJson.output
      .flatMap((item) => item.content || [])
      .filter((chunk) => chunk.type === 'output_text')
      .map((chunk) => chunk.text)
      .join('\n');
  };

  const extractCodeBlocks = (text) => {
    const htmlMatch = text.match(/```html\s*([\s\S]*?)```/i);
    const cssMatch = text.match(/```css\s*([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : '';
    const css = cssMatch ? cssMatch[1].trim() : '';

    if (html || css) {
      return {
        html: html || '<div class="app-shell">No HTML returned by model.</div>',
        css,
      };
    }

    // Fallback: accept plain HTML if model skipped markdown fences.
    return {
      html: text.trim() || '<div class="app-shell">No HTML returned by model.</div>',
      css: '',
    };
  };

  const buildWebsiteWithAI = async ({ mode }) => {
    setGenerationError('');

    if (!openAiApiKey) {
      setGenerationError('Missing OpenAI key. Set VITE_OPENAI_API_KEY in your .env file.');
      return;
    }

    if (!projectName.trim()) {
      setGenerationError('Please enter a project name first.');
      return;
    }

    if (!buildPrompt.trim()) {
      setGenerationError('Please enter the initial prompt describing your website.');
      return;
    }

    if (mode === 'feature' && !featurePrompt.trim()) {
      setGenerationError('Please enter the feature prompt you want to add.');
      return;
    }

    setIsGenerating(true);

    try {
      const userInstruction =
        mode === 'initial'
          ? `Build project "${projectName}" using HTML and CSS only.
Main prompt:
${buildPrompt}`
          : `You already generated a website for project "${projectName}".
Current HTML:
${generatedHtml}

Current CSS:
${generatedCss}

Add this new feature:
${featurePrompt}

Keep existing features working.`;

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          input: [
            {
              role: 'system',
              content:
                'You are a frontend website generator. Return only two fenced code blocks: first ```html``` and then ```css```. HTML must not include external libraries. Do not include explanations.',
            },
            {
              role: 'user',
              content: userInstruction,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}.`);
      }

      const data = await response.json();
      const outputText = getAssistantText(data);
      const { html, css } = extractCodeBlocks(outputText);

      setGeneratedHtml(html);
      setGeneratedCss(css);

      if (mode === 'feature') {
        setFeaturePrompt('');
      }
    } catch (error) {
      setGenerationError(error.message || 'Failed to generate website code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewDocument = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${generatedCss}</style>
  </head>
  <body>
    ${generatedHtml}
  </body>
</html>`;

  const renderCodeGenerator = () => (
    <div className="module-content">
      <div className="module-header">
        <h1 className="module-title">AI Frontend Project Builder</h1>
        <p className="module-desc">
          Create a project with prompts, generate HTML/CSS with GPT, then instantly preview the website.
        </p>
      </div>

      <div className="builder-grid">
        <div className="builder-panel">
          <label className="builder-label" htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            className="builder-input"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="e.g. Portfolio Landing Page"
          />

          <div className="builder-label">Choose Technology</div>
          <div className="tech-options">
            {AVAILABLE_TECH.map((tech) => (
              <button
                key={tech.id}
                type="button"
                className={`tech-option ${selectedTech === tech.id ? 'selected' : ''} ${!tech.enabled ? 'disabled' : ''}`}
                disabled={!tech.enabled}
                onClick={() => setSelectedTech(tech.id)}
              >
                <span>{tech.label}</span>
                {!tech.enabled && <small>Coming soon</small>}
              </button>
            ))}
          </div>

          <label className="builder-label" htmlFor="buildPrompt">Build Prompt</label>
          <textarea
            id="buildPrompt"
            className="builder-textarea"
            value={buildPrompt}
            onChange={(event) => setBuildPrompt(event.target.value)}
            placeholder="Create a modern hero section, services cards, and contact form..."
          />

          <button
            type="button"
            className="builder-btn"
            disabled={isGenerating || selectedTech !== 'html-css'}
            onClick={() => buildWebsiteWithAI({ mode: 'initial' })}
          >
            {isGenerating ? 'Generating...' : 'Start Coding with Prompt'}
          </button>

          <label className="builder-label" htmlFor="featurePrompt">Add Feature by Prompt</label>
          <textarea
            id="featurePrompt"
            className="builder-textarea small"
            value={featurePrompt}
            onChange={(event) => setFeaturePrompt(event.target.value)}
            placeholder="Add pricing section with 3 plans and CTA."
          />

          <button
            type="button"
            className="builder-btn secondary"
            disabled={isGenerating || !generatedHtml}
            onClick={() => buildWebsiteWithAI({ mode: 'feature' })}
          >
            {isGenerating ? 'Updating...' : 'Add Feature'}
          </button>

          {generationError && <p className="builder-error">{generationError}</p>}
        </div>

        <div className="builder-preview-panel">
          <div className="preview-header">
            <strong>Live Website Preview</strong>
            <span>{generatedHtml ? `${projectName || 'Untitled'} (${selectedTech})` : 'No code generated yet'}</span>
          </div>

          {generatedHtml ? (
            <iframe
              title="Generated Website Preview"
              className="website-preview-frame"
              sandbox="allow-scripts"
              srcDoc={previewDocument}
            />
          ) : (
            <div className="preview-empty">
              Generate your project first to see the created website here.
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

    if (activeModule === 'codeGen') {
      return renderCodeGenerator();
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
