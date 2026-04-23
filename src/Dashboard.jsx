import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  LayoutDashboard, FileCode2, BookOpen, Database, 
  Globe, Rocket, GitBranch, LayoutTemplate, 
  Calculator, Cloud, Users, UserCog, Settings, 
  Building, LogOut, ShieldAlert, Lock
} from 'lucide-react';
import CICDPipeline from './CICDPipeline';
import { useProjectStore } from './context/ProjectStore';
import './dashboard.css';

const MODULES = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  codeGen: { id: 'codeGen', label: 'Frontend Builder', icon: FileCode2 },
  backendGen: { id: 'backendGen', label: 'Backend Generator', icon: Database },
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
  employee: ['dashboard', 'codeGen', 'backendGen', 'docs'],
  project_manager: [
    'dashboard', 'codeGen', 'backendGen', 'docs', 'database', 'api', 
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
  const [isNewProjectMode, setIsNewProjectMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('about:blank');
  const [previewUrlInput, setPreviewUrlInput] = useState('about:blank');
  const [previewHistory, setPreviewHistory] = useState(['about:blank']);
  const [previewHistoryIndex, setPreviewHistoryIndex] = useState(0);
  const previewFrameRef = useRef(null);
  const previewHistoryIndexRef = useRef(0);
  const previewPendingNavigationRef = useRef(null);
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    upsertProject,
    deleteProject,
  } = useProjectStore();

  const allowedModules = ROLE_ACCESS[user.role.toLowerCase()] || [];
  const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const tenantProjects = useMemo(
    () =>
      projects
        .filter((project) => project.tenantId === user.tenantId)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
    [projects, user.tenantId]
  );
  const selectedProject = tenantProjects.find((project) => project.id === selectedProjectId) || null;

  const handleNavClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  const hasAccess = (moduleId) => allowedModules.includes(moduleId);

  useEffect(() => {
    if (isNewProjectMode) {
      return;
    }

    if (!tenantProjects.length) {
      if (selectedProjectId) setSelectedProjectId(null);
      return;
    }

    if (!selectedProject || selectedProject.tenantId !== user.tenantId) {
      setSelectedProjectId(tenantProjects[0].id);
    }
  }, [isNewProjectMode, selectedProject, selectedProjectId, setSelectedProjectId, tenantProjects, user.tenantId]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    setIsNewProjectMode(false);
    setProjectName(selectedProject.name || '');
    setSelectedTech(selectedProject.tech || 'html-css');
    setBuildPrompt(selectedProject.buildPrompt || '');
    setGeneratedHtml(selectedProject.generatedHtml || '');
    setGeneratedCss(selectedProject.generatedCss || '');
    setFeaturePrompt('');
    setGenerationError('');
  }, [selectedProject]);

  useEffect(() => {
    previewHistoryIndexRef.current = previewHistoryIndex;
  }, [previewHistoryIndex]);

  useEffect(() => {
    const onPreviewMessage = (event) => {
      if (event.source !== previewFrameRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || payload.source !== 'triffid-preview' || payload.type !== 'state') return;

      const incomingUrl = payload.url || 'about:blank';
      setPreviewUrl(incomingUrl);
      setPreviewUrlInput(incomingUrl);
      setPreviewHistory((currentHistory) => {
        const currentIndex = previewHistoryIndexRef.current;
        const pending = previewPendingNavigationRef.current;
        if (pending && pending.url === incomingUrl) {
          previewPendingNavigationRef.current = null;
          setPreviewHistoryIndex(pending.index);
          return currentHistory;
        }

        const activeUrl = currentHistory[currentIndex];
        if (incomingUrl === activeUrl) return currentHistory;

        const head = currentHistory.slice(0, currentIndex + 1);
        const nextHistory = [...head, incomingUrl];
        setPreviewHistoryIndex(nextHistory.length - 1);
        return nextHistory;
      });
    };

    window.addEventListener('message', onPreviewMessage);
    return () => window.removeEventListener('message', onPreviewMessage);
  }, []);

  useEffect(() => {
    if (!generatedHtml) {
      previewPendingNavigationRef.current = null;
      setPreviewUrl('about:blank');
      setPreviewUrlInput('about:blank');
      setPreviewHistory(['about:blank']);
      setPreviewHistoryIndex(0);
      return;
    }

    previewPendingNavigationRef.current = null;
    setPreviewUrl('about:srcdoc');
    setPreviewUrlInput('about:srcdoc');
    setPreviewHistory(['about:srcdoc']);
    setPreviewHistoryIndex(0);
  }, [generatedHtml]);

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
      const activeProjectId = selectedProject?.id || crypto.randomUUID();
      const historyItem = {
        id: crypto.randomUUID(),
        mode,
        prompt: mode === 'initial' ? buildPrompt.trim() : featurePrompt.trim(),
        html,
        css,
        generatedAt: new Date().toISOString(),
      };

      upsertProject({
        id: activeProjectId,
        tenantId: user.tenantId,
        ownerEmail: user.email,
        name: projectName.trim(),
        tech: selectedTech,
        buildPrompt: buildPrompt.trim(),
        generatedHtml: html,
        generatedCss: css,
        featurePrompts:
          mode === 'feature'
            ? [...(selectedProject?.featurePrompts || []), featurePrompt.trim()]
            : selectedProject?.featurePrompts || [],
        history: [...(selectedProject?.history || []), historyItem],
      });
      setIsNewProjectMode(false);
      setSelectedProjectId(activeProjectId);

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
    <base href="https://example.com/" />
    <style>${generatedCss}</style>
  </head>
  <body>
    ${generatedHtml}
    <script>
      (function () {
        const safePostState = () => {
          try {
            window.parent.postMessage(
              {
                source: 'triffid-preview',
                type: 'state',
                url: window.location.href,
                canGoBack: window.history.length > 1
              },
              '*'
            );
          } catch (error) {
            // Ignore cross-origin post errors in preview.
          }
        };

        const toAbsoluteUrl = (raw) => {
          try {
            return new URL(raw, window.location.href).toString();
          } catch (error) {
            return null;
          }
        };

        document.addEventListener(
          'click',
          (event) => {
            const link = event.target.closest && event.target.closest('a[href]');
            if (!link) return;
            if (link.target && link.target !== '_self') return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('javascript:')) return;
            const absoluteUrl = toAbsoluteUrl(href);
            if (!absoluteUrl) return;
            event.preventDefault();
            window.location.assign(absoluteUrl);
          },
          true
        );

        window.addEventListener('message', (event) => {
          const payload = event.data;
          if (!payload || payload.source !== 'triffid-parent') return;

          if (payload.command === 'back') window.history.back();
          if (payload.command === 'forward') window.history.forward();
          if (payload.command === 'reload') window.location.reload();
          if (payload.command === 'navigate' && payload.url) window.location.assign(payload.url);
        });

        window.addEventListener('load', safePostState);
        window.addEventListener('hashchange', safePostState);
        window.addEventListener('popstate', safePostState);
        safePostState();
      })();
    </script>
  </body>
</html>`;

  const sendPreviewCommand = (command, payload = {}) => {
    const frameWindow = previewFrameRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage({ source: 'triffid-parent', command, ...payload }, '*');
  };

  const normalizeUrl = (rawUrl) => {
    const candidate = rawUrl.trim();
    if (!candidate) return '';
    if (candidate.startsWith('about:')) return candidate;

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(candidate);
    const withProtocol = hasProtocol ? candidate : `https://${candidate}`;

    try {
      return new URL(withProtocol).toString();
    } catch (error) {
      return '';
    }
  };

  const handlePreviewNavigation = () => {
    const normalized = normalizeUrl(previewUrlInput);
    if (!normalized) {
      setGenerationError('Enter a valid preview URL (for example: example.com).');
      return;
    }
    setGenerationError('');
    sendPreviewCommand('navigate', { url: normalized });
  };

  const handlePreviewBack = () => {
    if (previewHistoryIndex <= 0) return;
    const nextIndex = previewHistoryIndex - 1;
    const targetUrl = previewHistory[nextIndex];
    if (!targetUrl) return;
    previewPendingNavigationRef.current = { url: targetUrl, index: nextIndex };
    setPreviewHistoryIndex(nextIndex);
    setPreviewUrl(targetUrl);
    setPreviewUrlInput(targetUrl);
    sendPreviewCommand('navigate', { url: targetUrl });
  };

  const handlePreviewForward = () => {
    if (previewHistoryIndex >= previewHistory.length - 1) return;
    const nextIndex = previewHistoryIndex + 1;
    const targetUrl = previewHistory[nextIndex];
    if (!targetUrl) return;
    previewPendingNavigationRef.current = { url: targetUrl, index: nextIndex };
    setPreviewHistoryIndex(nextIndex);
    setPreviewUrl(targetUrl);
    setPreviewUrlInput(targetUrl);
    sendPreviewCommand('navigate', { url: targetUrl });
  };

  const handleCreateFreshProject = () => {
    setIsNewProjectMode(true);
    setSelectedProjectId(null);
    setProjectName('');
    setSelectedTech('html-css');
    setBuildPrompt('');
    setFeaturePrompt('');
    setGeneratedHtml('');
    setGeneratedCss('');
    setGenerationError('');
  };

  const handleProjectSelect = (projectId) => {
    if (!projectId) {
      handleCreateFreshProject();
      return;
    }
    setIsNewProjectMode(false);
    setSelectedProjectId(projectId);
  };

  const handleDeleteCurrentProject = () => {
    if (!selectedProject) return;
    deleteProject(selectedProject.id);
    handleCreateFreshProject();
  };

  const handleOpenProjectFromDashboard = (projectId) => {
    setIsNewProjectMode(false);
    setSelectedProjectId(projectId);
    setActiveModule('codeGen');
  };

  const renderCodeGenerator = () => (
    <div className="module-content">
      <div className="module-header">
        <h1 className="module-title">AI Frontend Project Builder</h1>
        <p className="module-desc">
          Create a project with prompts, generate HTML/CSS with GPT, then instantly preview the website.
        </p>
      </div>

      <div className="builder-grid">
        {isGenerating ? (
          <div className="generation-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="generation-overlay-core">
              <div className="generation-rings" />
              <div className="generation-rings ring-delay" />
              <div className="generation-rings ring-delay-2" />
              <div className="generation-center">
                <FileCode2 size={46} />
              </div>
            </div>
            <h3>Generating Code</h3>
            <p>AI is building your project right now...</p>
          </div>
        ) : null}

        <div className="builder-panel">
          <div className="project-store-toolbar">
            <select
              className="builder-select"
              value={selectedProject?.id || ''}
              onChange={(event) => handleProjectSelect(event.target.value)}
            >
              <option value="">New Project (Unsaved)</option>
              {tenantProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.tech}
                </option>
              ))}
            </select>
            <button type="button" className="builder-btn secondary slim" onClick={handleCreateFreshProject}>
              New
            </button>
            <button
              type="button"
              className="builder-btn secondary slim danger"
              onClick={handleDeleteCurrentProject}
              disabled={!selectedProject}
            >
              Delete
            </button>
          </div>

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
            <div className="preview-browser-bar">
              <div className="preview-nav-buttons">
                <button
                  type="button"
                  className="preview-nav-btn"
                  onClick={handlePreviewBack}
                  disabled={previewHistoryIndex <= 0}
                  aria-label="Go back"
                  title="Back"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="preview-nav-btn"
                  onClick={handlePreviewForward}
                  disabled={previewHistoryIndex >= previewHistory.length - 1}
                  aria-label="Go forward"
                  title="Forward"
                >
                  →
                </button>
                <button
                  type="button"
                  className="preview-nav-btn"
                  onClick={() => sendPreviewCommand('reload')}
                  aria-label="Reload"
                  title="Reload"
                >
                  ↻
                </button>
              </div>
              <form
                className="preview-url-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handlePreviewNavigation();
                }}
              >
                <input
                  className="preview-url-input"
                  value={previewUrlInput}
                  onChange={(event) => setPreviewUrlInput(event.target.value)}
                  aria-label="Preview URL"
                  placeholder="Enter website URL"
                />
                <button type="submit" className="preview-go-btn">
                  Go
                </button>
              </form>
              <span className="preview-url-current" title={previewUrl}>
                {previewUrl}
              </span>
            </div>
          ) : null}

          {generatedHtml ? (
            <iframe
              ref={previewFrameRef}
              title="Generated Website Preview"
              className="website-preview-frame"
              sandbox="allow-scripts allow-forms"
              srcDoc={previewDocument}
            />
          ) : (
            <div className="preview-empty">
              Generate your project first to see the created website here.
            </div>
          )}

          {selectedProject?.history?.length ? (
            <div className="history-panel">
              <div className="builder-label">Project History</div>
              <div className="history-list">
                {selectedProject.history.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="history-item">
                    <strong>{entry.mode === 'initial' ? 'Initial Build' : 'Feature Update'}</strong>
                    <span>{entry.prompt}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderBackendGenerator = () => (
    <div className="module-content">
      <div className="module-header">
        <h1 className="module-title">Backend Generator</h1>
        <p className="module-desc">
          Generate backend APIs, database schema, and service logic from prompts.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.8rem' }}>Coming Next</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          This page is ready in navigation. Next step is to enable prompt-based backend generation
          (Node/Express, routes, controllers, schema, auth, and API docs) using GPT.
        </p>
        <div className="grid-cards">
          <div className="card">
            <div className="card-title">Planned Stacks</div>
            <div style={{ color: 'var(--text-secondary)' }}>Node + Express, NestJS, FastAPI</div>
          </div>
          <div className="card">
            <div className="card-title">Planned Output</div>
            <div style={{ color: 'var(--text-secondary)' }}>Routes, Services, Models, Env setup</div>
          </div>
          <div className="card">
            <div className="card-title">Persistence</div>
            <div style={{ color: 'var(--text-secondary)' }}>Saved to localStorage like frontend projects</div>
          </div>
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

    if (activeModule === 'backendGen') {
      return renderBackendGenerator();
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

        {activeModule === 'dashboard' && (
          <div className="card project-list-card">
            <div className="card-title">Created Projects</div>
            {tenantProjects.length ? (
              <div className="project-list">
                {tenantProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className="project-list-item"
                    onClick={() => handleOpenProjectFromDashboard(project.id)}
                  >
                    <div className="project-list-item-head">
                      <strong>{project.name || 'Untitled Project'}</strong>
                      <span>{project.tech || 'html-css'}</span>
                    </div>
                    <p>{project.buildPrompt || 'No build prompt saved yet.'}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="project-list-empty">
                No projects yet. Open AI Code Generator to create your first project.
              </p>
            )}
          </div>
        )}

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
            {renderSidebarItem('backendGen')}
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
