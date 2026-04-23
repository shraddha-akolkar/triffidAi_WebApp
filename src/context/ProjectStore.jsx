import React, { createContext, useContext, useMemo, useState } from 'react';

const PROJECTS_STORAGE_KEY = 'triffidai.projects.v1';
const SELECTED_PROJECT_STORAGE_KEY = 'triffidai.selectedProjectId.v1';

const ProjectStoreContext = createContext(null);

const readJson = (key, fallbackValue) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures.
  }
};

export const ProjectStoreProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => readJson(PROJECTS_STORAGE_KEY, []));
  const [selectedProjectId, setSelectedProjectIdState] = useState(() =>
    readJson(SELECTED_PROJECT_STORAGE_KEY, null)
  );

  const setSelectedProjectId = (projectId) => {
    setSelectedProjectIdState(projectId);
    writeJson(SELECTED_PROJECT_STORAGE_KEY, projectId);
  };

  const upsertProject = (projectPayload) => {
    const now = new Date().toISOString();
    const project = { ...projectPayload, updatedAt: now };

    setProjects((prevProjects) => {
      const index = prevProjects.findIndex((existing) => existing.id === project.id);
      const nextProjects =
        index >= 0
          ? prevProjects.map((existing, idx) => (idx === index ? { ...existing, ...project } : existing))
          : [{ ...project, createdAt: now }, ...prevProjects];

      writeJson(PROJECTS_STORAGE_KEY, nextProjects);
      return nextProjects;
    });
  };

  const deleteProject = (projectId) => {
    setProjects((prevProjects) => {
      const nextProjects = prevProjects.filter((project) => project.id !== projectId);
      writeJson(PROJECTS_STORAGE_KEY, nextProjects);
      return nextProjects;
    });

    if (projectId === selectedProjectId) {
      setSelectedProjectId(null);
    }
  };

  const value = useMemo(
    () => ({
      projects,
      selectedProjectId,
      setSelectedProjectId,
      upsertProject,
      deleteProject,
    }),
    [projects, selectedProjectId]
  );

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>;
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);

  if (!context) {
    throw new Error('useProjectStore must be used inside ProjectStoreProvider.');
  }

  return context;
};
