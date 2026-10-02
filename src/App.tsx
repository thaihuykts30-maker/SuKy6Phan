import React, { useState, useEffect } from 'react';
import { SAMPLE_PROJECTS } from './data/samples';
import { MasterScriptProject, CinematicScene } from './types/script';
import { Header } from './components/Header';
import { ScriptWorkspace } from './components/ScriptWorkspace';
import { CreateScriptModal } from './components/CreateScriptModal';
import { ImportFileModal } from './components/ImportFileModal';
import { TeleprompterView } from './components/TeleprompterView';
import { exportToMarkdown, downloadFile } from './utils/export';
import { MASTER_SCENE_ALLOCATIONS, parseTimestampToSeconds, DEFAULT_CHARS_PER_SECOND } from './utils/pacing';
import { ImportSummary } from './utils/importer';
import { CheckCircle, Sparkles, X, FileText } from 'lucide-react';

const STORAGE_KEY_CURRENT = 'su_ky_4_hoi_current_project';
const STORAGE_KEY_CUSTOM_LIST = 'su_ky_4_hoi_custom_projects';

// Helper to ensure all scenes have live pacing & character count metadata
export function enrichProjectWithPacing(project: MasterScriptProject): MasterScriptProject {
  const enrich = (scenes: CinematicScene[]) =>
    scenes.map((s) => {
      const alloc = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === s.sceneNumber);
      const timestamp = s.timestamp || (alloc ? alloc.timestamp : '00:00 - 01:15');
      const { durationSec } = parseTimestampToSeconds(timestamp);
      const narration = s.narration || '';
      const exactCharCount = narration.length;
      const targetCharCount = alloc ? alloc.targetCharactersStandard : Math.round(durationSec * DEFAULT_CHARS_PER_SECOND);
      const matchPercentage = targetCharCount > 0 ? Math.round((exactCharCount / targetCharCount) * 100) : 100;

      return {
        ...s,
        timestamp,
        durationSeconds: durationSec,
        characterCount: exactCharCount,
        targetCharacterCount: targetCharCount,
        matchPercentage,
      };
    });

  return {
    ...project,
    act1: { ...project.act1, scenes: enrich(project.act1.scenes) },
    act2: { ...project.act2, scenes: enrich(project.act2.scenes) },
    act3: { ...project.act3, scenes: enrich(project.act3.scenes) },
    act4: { ...project.act4, scenes: enrich(project.act4.scenes) },
  };
}

export default function App() {
  const [allProjects, setAllProjects] = useState<MasterScriptProject[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_LIST);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const filteredSamples = SAMPLE_PROJECTS.filter((s) => !customIds.has(s.id));
          return [...parsed.map(enrichProjectWithPacing), ...filteredSamples.map(enrichProjectWithPacing)];
        }
      }
    } catch (e) {
      console.warn('Could not parse saved custom projects', e);
    }
    return SAMPLE_PROJECTS.map(enrichProjectWithPacing);
  });

  const [currentProject, setCurrentProject] = useState<MasterScriptProject>(() => {
    try {
      const savedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        if (parsed && parsed.profile && parsed.act1) {
          return enrichProjectWithPacing(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse saved current project', e);
    }
    return enrichProjectWithPacing(SAMPLE_PROJECTS[0]);
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [importSuccessToast, setImportSuccessToast] = useState<{
    characterName: string;
    fileName: string;
    format: string;
    totalScenes: number;
  } | null>(null);

  // Sync current project to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentProject));
    } catch (e) {
      console.warn('Could not save current project to storage', e);
    }
  }, [currentProject]);

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(currentProject);
    const filename = `${currentProject.profile.characterName
      .toLowerCase()
      .replace(/\s+/g, '-')}-kich-ban-6-phan.md`;
    downloadFile(filename, md, 'text/markdown');
  };

  const handleUpdateProject = (updated: MasterScriptProject) => {
    const enriched = enrichProjectWithPacing(updated);
    setCurrentProject(enriched);
    setAllProjects((prev) =>
      prev.map((p) => (p.id === enriched.id ? enriched : p))
    );

    // Save custom projects
    try {
      const customOnes = allProjects
        .map((p) => (p.id === enriched.id ? enriched : p))
        .filter((p) => !SAMPLE_PROJECTS.some((s) => s.id === p.id));
      localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(customOnes));
    } catch (e) {
      console.warn('Failed to save updated project', e);
    }
  };

  const handleNewProjectCreated = (newProject: MasterScriptProject) => {
    const enriched = enrichProjectWithPacing(newProject);
    setCurrentProject(enriched);
    const updatedAll = [enriched, ...allProjects.filter((p) => p.id !== enriched.id)];
    setAllProjects(updatedAll);

    // Persist custom projects to localStorage
    try {
      const customOnes = updatedAll.filter((p) => !SAMPLE_PROJECTS.some((s) => s.id === p.id));
      localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(customOnes));
    } catch (e) {
      console.warn('Failed to save new project to storage', e);
    }
  };

  const handleProjectImported = (importedProject: MasterScriptProject, summary: ImportSummary) => {
    const enriched = enrichProjectWithPacing(importedProject);
    setCurrentProject(enriched);
    const updatedAll = [enriched, ...allProjects.filter((p) => p.id !== enriched.id)];
    setAllProjects(updatedAll);

    // Persist imported project to localStorage
    try {
      const customOnes = updatedAll.filter((p) => !SAMPLE_PROJECTS.some((s) => s.id === p.id));
      localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(customOnes));
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(enriched));
    } catch (e) {
      console.warn('Failed to save imported project to storage', e);
    }

    setImportSuccessToast({
      characterName: enriched.profile.characterName,
      fileName: summary.fileName,
      format: summary.formatDetected,
      totalScenes: summary.totalScenesMapped,
    });

    setTimeout(() => {
      setImportSuccessToast(null);
    }, 6000);
  };

  const handleBatchProjectsImported = (projects: MasterScriptProject[], summaries: ImportSummary[]) => {
    if (!projects || projects.length === 0) return;

    const enrichedList = projects.map(enrichProjectWithPacing);
    const activeProject = enrichedList[0];
    setCurrentProject(activeProject);

    // Merge into allProjects avoiding duplicate IDs
    const newIds = new Set(enrichedList.map((p) => p.id));
    const oldFiltered = allProjects.filter((p) => !newIds.has(p.id));
    const updatedAll = [...enrichedList, ...oldFiltered];
    setAllProjects(updatedAll);

    // Persist all custom projects to localStorage
    try {
      const customOnes = updatedAll.filter((p) => !SAMPLE_PROJECTS.some((s) => s.id === p.id));
      localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(customOnes));
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(activeProject));
    } catch (e) {
      console.warn('Failed to save batch imported projects to storage', e);
    }

    const charNames = enrichedList.map((p) => p.profile.characterName);
    const sampleNames =
      charNames.slice(0, 3).join(', ') + (charNames.length > 3 ? ` và ${charNames.length - 3} nhân vật khác` : '');

    setImportSuccessToast({
      characterName: `${enrichedList.length} Kịch Bản: ${sampleNames}`,
      fileName: `Thư mục/Bộ tệp (${summaries.length} files)`,
      format: `${enrichedList.length} Dự Án`,
      totalScenes: enrichedList.reduce((acc, p) => acc + 12, 0),
    });

    setTimeout(() => {
      setImportSuccessToast(null);
    }, 7000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-stone-950 relative">
      {/* Success Toast Notification */}
      {importSuccessToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full bg-stone-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-black p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Import File Thành Công
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-400 font-mono">
                  {importSuccessToast.format.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-serif font-bold text-amber-200 truncate mt-0.5">
                {importSuccessToast.characterName}
              </p>
              <p className="text-xs text-stone-300 mt-1">
                Toàn bộ dữ liệu từ tệp <span className="font-mono text-stone-100">"{importSuccessToast.fileName}"</span> đã được tự động nạp chính xác vào cấu trúc 6 Phần chính & {importSuccessToast.totalScenes} phân cảnh!
              </p>
            </div>
            <button
              onClick={() => setImportSuccessToast(null)}
              className="text-stone-400 hover:text-stone-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar with Project Switcher */}
      <Header
        currentProject={currentProject}
        sampleProjects={allProjects}
        onSelectProject={(proj) => setCurrentProject(enrichProjectWithPacing(proj))}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1">
        <ScriptWorkspace
          project={currentProject}
          onUpdateProject={handleUpdateProject}
          onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
          onExportMarkdown={handleExportMarkdown}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <p>
          Sử Ký 6 Phần • Master Script Framework Studio • Tối ưu kịch bản video tài liệu lịch sử 6 Phần Chính (20 - 35 phút)
        </p>
      </footer>

      {/* Create New Script Modal */}
      <CreateScriptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleNewProjectCreated}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Import File Modal */}
      <ImportFileModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onProjectImported={handleProjectImported}
        onBatchProjectsImported={handleBatchProjectsImported}
      />

      {/* Teleprompter Studio Fullscreen */}
      {isTeleprompterOpen && (
        <TeleprompterView
          project={currentProject}
          onClose={() => setIsTeleprompterOpen(false)}
        />
      )}
    </div>
  );
}
