import React, { useState } from 'react';
import { 
  GitBranch, Box, FileCheck, Rocket, 
  Play, Pause, Edit3, Terminal, Activity, 
  Server, Cpu, AlertCircle, Bell, BarChart2 
} from 'lucide-react';
import './cicdpipeline.css';

const CICDPipeline = () => {
  const [activeEnv, setActiveEnv] = useState('Production');
  const [pipelineStatus, setPipelineStatus] = useState('Running');

  return (
    <div className="cicd-container">
      {/* CI/CD Pipeline Module */}
      <section className="cicd-section">
        <div className="cicd-header">
          <h2 className="cicd-title">
            <GitBranch size={28} color="var(--primary)" />
            CI/CD Pipeline
          </h2>
          <p className="cicd-desc">
            Automate the build, testing, and deployment process with a streamlined CI/CD pipeline. Ensure faster delivery, improved code quality, and reliable releases.
          </p>
          <div className="pro-line">
            👉 Automate your development workflow and deliver faster with reliable CI/CD pipelines.
          </div>
        </div>

        <div className="pipeline-setup">
          <h3 style={{ marginBottom: '0.5rem' }}>Configure Your Pipeline</h3>
          <p className="cicd-desc" style={{ marginBottom: '1.5rem' }}>
            Define stages for your application lifecycle and automate workflows from code commit to deployment.
          </p>

          <div className="pipeline-stages">
            <div className="stage-card">
              <div className="stage-icon-wrap"><GitBranch size={24} /></div>
              <div className="stage-title">Source Control</div>
              <div className="stage-desc">Connect your repository (GitHub, GitLab, etc.)</div>
            </div>
            <div className="stage-card">
              <div className="stage-icon-wrap"><Box size={24} /></div>
              <div className="stage-title">Build Stage</div>
              <div className="stage-desc">Compile code and prepare application artifacts</div>
            </div>
            <div className="stage-card">
              <div className="stage-icon-wrap"><FileCheck size={24} /></div>
              <div className="stage-title">Test Stage</div>
              <div className="stage-desc">Run automated tests to ensure code quality</div>
            </div>
            <div className="stage-card">
              <div className="stage-icon-wrap"><Rocket size={24} /></div>
              <div className="stage-title">Deployment</div>
              <div className="stage-desc">Deploy application to selected environment</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pipeline Status: </span>
            <div className={`status-badge ${pipelineStatus.toLowerCase()}`}>
              {pipelineStatus === 'Running' ? (
                <><Activity size={14} className="detecting" /> Running - Build Stage</>
              ) : (
                <><FileCheck size={14} /> Success</>
              )}
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn-action secondary"><Edit3 size={16}/> Edit Pipeline</button>
            <button className="btn-action secondary"><Terminal size={16}/> View Logs</button>
            <button 
              className="btn-action primary"
              onClick={() => setPipelineStatus(pipelineStatus === 'Running' ? 'Success' : 'Running')}
            >
              {pipelineStatus === 'Running' ? <Pause size={16}/> : <Play size={16}/>} 
              {pipelineStatus === 'Running' ? 'Pause' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        <div className="pipeline-controls">
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Target Environment:</div>
          <div className="environment-tags">
            {['Development', 'Staging', 'Production'].map(env => (
              <div 
                key={env} 
                className={`env-tag ${activeEnv === env ? 'active' : ''}`}
                onClick={() => setActiveEnv(env)}
              >
                {env}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monitoring & Observability Module */}
      <section className="cicd-section">
        <div className="cicd-header">
          <h2 className="cicd-title">
            <Activity size={28} color="var(--secondary)" />
            Monitoring & Observability
          </h2>
          <p className="cicd-desc">
            Monitor application performance, track system health, and gain real-time insights into your infrastructure and deployments.
          </p>
          <div className="pro-line" style={{ borderLeftColor: 'var(--secondary)', color: 'var(--secondary)' }}>
            👉 Gain complete visibility into your system and ensure high performance and reliability.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} /> Dashboard Overview
          </h3>
          <p className="cicd-desc" style={{ marginBottom: '1.5rem' }}>
            Visual representation of system performance and usage through charts and analytics. Tracking application availability and ensuring minimal downtime.
          </p>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                System Health <Server size={16} />
              </div>
              <div className="metric-value" style={{ color: 'var(--secondary)' }}>99.98%</div>
              <div className="metric-trend trend-up">Uptime Monitoring</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                CPU & Memory Use <Cpu size={16} />
              </div>
              <div className="metric-value">42%</div>
              <div className="metric-trend trend-down">Normal Load</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                API Response Time <Activity size={16} />
              </div>
              <div className="metric-value">124ms</div>
              <div className="metric-trend trend-up">Optimal Performance</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                Error Rates <AlertCircle size={16} />
              </div>
              <div className="metric-value">0.02%</div>
              <div className="metric-trend trend-up">Detect errors & failures</div>
            </div>
          </div>
        </div>

        <div className="pipeline-controls" style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Observability Actions:</div>
          <div className="action-buttons">
            <button className="btn-action secondary"><Terminal size={16}/> View Logs</button>
            <button className="btn-action secondary"><Bell size={16}/> Set Alerts</button>
            <button className="btn-action secondary"><BarChart2 size={16}/> Analyze Performance</button>
            <button className="btn-action primary" style={{ background: 'var(--secondary)' }}><AlertCircle size={16}/> Debug Issues</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CICDPipeline;
