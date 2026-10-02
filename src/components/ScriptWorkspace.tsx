import React, { useState } from 'react';
import {
  Film,
  User,
  Layers,
  BookOpen,
  Clock,
  Flame,
  Download,
  Mic,
  Sparkles,
  Filter,
  CheckCircle2,
  Gauge,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Camera,
  Compass,
  Search,
  ArrowRight,
  Play,
} from 'lucide-react';
import { MasterScriptProject, CinematicScene } from '../types/script';
import { ActCard } from './ActCard';
import { PartCard } from './PartCard';
import { CharacterProfileView } from './CharacterProfileView';
import { PromptVaultView } from './PromptVaultView';
import { FrameworkGuideView } from './FrameworkGuideView';
import { RefineSceneModal } from './RefineSceneModal';
import { VisualDirectorStudio } from './VisualDirectorStudio';
import { AudioProducerStudioView } from './AudioProducerStudioView';
import {
  MASTER_SCENE_ALLOCATIONS,
  MASTER_SIX_PARTS_CONFIG,
  getSixPartsFromProject,
  analyzePacing,
  DEFAULT_CHARS_PER_SECOND,
  fineTuneNarrationTo100Percent,
  CHRONOLOGICAL_PHASES,
} from '../utils/pacing';

interface ScriptWorkspaceProps {
  project: MasterScriptProject;
  onUpdateProject: (updatedProject: MasterScriptProject) => void;
  onOpenTeleprompter: () => void;
  onExportMarkdown: () => void;
  onOpenCreateModal: () => void;
  onOpenImportModal?: () => void;
}

export const ScriptWorkspace: React.FC<ScriptWorkspaceProps> = ({
  project,
  onUpdateProject,
  onOpenTeleprompter,
  onExportMarkdown,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'director' | 'audio' | 'profile' | 'prompts' | 'guide'>('script');
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | 'all'>('all');
  const [selectedActFilter, setSelectedActFilter] = useState<number | 'all'>('all');
  const [chronologicalFilter, setChronologicalFilter] = useState<'all' | 'xuat_than' | 'buoc_ngoat' | 'dinh_cao' | 'sup_do' | 'di_san'>('all');
  const [refineTargetScene, setRefineTargetScene] = useState<CinematicScene | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showPacingAudit, setShowPacingAudit] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  // Quick Character Bar States
  const [quickCharacterName, setQuickCharacterName] = useState('');
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);
  const [isContinuingStage, setIsContinuingStage] = useState(false);

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(null), 3500);
  };

  const handleRefineSceneSuccess = (updatedScene: CinematicScene) => {
    const updateSceneList = (scenes: CinematicScene[]) =>
      scenes.map((s) => (s.id === updatedScene.id || s.sceneNumber === updatedScene.sceneNumber ? updatedScene : s));

    const updated: MasterScriptProject = {
      ...project,
      act1: { ...project.act1, scenes: updateSceneList(project.act1.scenes) },
      act2: { ...project.act2, scenes: updateSceneList(project.act2.scenes) },
      act3: { ...project.act3, scenes: updateSceneList(project.act3.scenes) },
      act4: { ...project.act4, scenes: updateSceneList(project.act4.scenes) },
    };

    onUpdateProject(updated);
  };

  // Quick Character Analysis & Direct Proposal Distribution into 6 Parts
  const handleQuickAnalyzeAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCharacterName.trim()) return;
    setIsQuickAnalyzing(true);
    try {
      showToast(`Đang phân tích 100% Chính Sử cho "${quickCharacterName.trim()}"...`);
      // Step 1: Analyze 6 parts with 100% Chính Sử
      const anaRes = await fetch('/api/analyze-character-six-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: quickCharacterName.trim(),
          targetDurationMinutes: 34,
        }),
      });
      const anaData = await anaRes.json();
      const analysis = anaData.analysis;

      // Step 2: Generate script with Phần 1 & 2 in exhaustive detail
      showToast(`Đang phân bổ đề xuất thẳng vào Lời bình 6 Phần (Viết chi tiết Phần 1 & 2 trước)...`);
      const genRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: quickCharacterName.trim(),
          eraOrContext: analysis?.historicalEraAndContext || '',
          targetDurationMinutes: 34,
          heroicTragicRatio: analysis?.actEmotionMusicRatio?.heroicPercent || 65,
          toneStyle: analysis?.directorStyleAndTone?.styleKey || 'epic-tragic',
          speechRateMode: analysis?.voiceoverPacingTech?.speedMode || 'standard',
          directorSixPartAnalysis: analysis,
          generationMode: 'parts_1_2',
        }),
      });
      const genData = await genRes.json();
      if (genData.project) {
        onUpdateProject(genData.project);
        setQuickCharacterName('');
        showToast(`Đã phân tích chính sử và tạo kịch bản cho ${quickCharacterName.trim()}! Phần 1 & 2 đã viết chi tiết tối đa.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi phân tích nhân vật.');
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  // Handler to Continue Writing Script Stages (Prevent AI truncation)
  const handleContinueWritingStage = async (targetStage: 'parts_3_4' | 'parts_5_6' | 'all_remaining') => {
    setIsContinuingStage(true);
    try {
      showToast(
        targetStage === 'parts_3_4'
          ? 'Đang viết tiếp Phần 3 & 4 chi tiết tối đa (~11.800 ký tự)...'
          : targetStage === 'parts_5_6'
          ? 'Đang viết tiếp Phần 5 & 6 chi tiết tối đa (~8.000 ký tự)...'
          : 'Đang viết tiếp toàn bộ các phần còn lại chi tiết 100%...'
      );

      const res = await fetch('/api/continue-script-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: project.profile.characterName,
          targetStage,
          eraOrContext: project.profile.era,
          speechRateMode: 'standard',
          directorSixPartAnalysis: project.directorSixPartAnalysis || project.profile.directorSixPartAnalysis,
          currentProject: project,
        }),
      });

      if (!res.ok) {
        throw new Error('API server không phản hồi.');
      }

      const data = await res.json();
      if (data.project) {
        onUpdateProject(data.project);
        showToast(
          targetStage === 'parts_3_4'
            ? 'Đã hoàn tất chi tiết Phần 3 & 4! Nhấn tiếp tục để viết Phần 5 & 6.'
            : targetStage === 'parts_5_6'
            ? 'Đã hoàn tất chi tiết Phần 5 & 6! Kịch bản 34 phút hoàn chỉnh 100%.'
            : 'Đã hoàn tất chi tiết toàn bộ các phần của kịch bản!'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast('Lỗi khi viết tiếp kịch bản. Vui lòng thử lại.');
    } finally {
      setIsContinuingStage(false);
    }
  };

  // Calculate project-wide character counts and duration
  const allScenes: CinematicScene[] = [
    ...(project.act1?.scenes || []),
    ...(project.act2?.scenes || []),
    ...(project.act3?.scenes || []),
    ...(project.act4?.scenes || []),
  ];

  const totalCharacters = allScenes.reduce((sum, s) => sum + (s.narration?.length || 0), 0);
  const totalTargetChars = MASTER_SCENE_ALLOCATIONS.reduce((sum, a) => sum + a.targetCharactersStandard, 0); // 26,520
  const overallMatchPct = totalTargetChars > 0 ? Math.round((totalCharacters / totalTargetChars) * 100) : 100;

  // 1-Click Sync all 12 scenes to 100% of maximum duration (34 mins)
  const handleSyncAllScenesToMaxDuration = async () => {
    setIsSyncingAll(true);
    try {
      const syncList = (scenes: CinematicScene[]) =>
        scenes.map((s) => {
          const alloc = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === s.sceneNumber);
          if (!alloc) return s;

          const durationSec = alloc.durationSeconds;
          const timestamp = alloc.timestamp;
          const targetChars = alloc.targetCharactersStandard;

          // Fine tune text to reach target characters
          const tunedText = fineTuneNarrationTo100Percent(
            s.narration,
            durationSec,
            DEFAULT_CHARS_PER_SECOND
          );

          return {
            ...s,
            timestamp,
            durationSeconds: durationSec,
            narration: tunedText,
            characterCount: tunedText.length,
            targetCharacterCount: targetChars,
            matchPercentage: Math.round((tunedText.length / targetChars) * 100),
          };
        });

      const updatedProject: MasterScriptProject = {
        ...project,
        profile: {
          ...project.profile,
          targetDurationMinutes: 34,
        },
        act1: {
          ...project.act1,
          actDuration: '5 phút (00:00 - 05:00)',
          scenes: syncList(project.act1.scenes),
        },
        act2: {
          ...project.act2,
          actDuration: '12 phút (05:00 - 17:00)',
          scenes: syncList(project.act2.scenes),
        },
        act3: {
          ...project.act3,
          actDuration: '10 phút (17:00 - 27:00)',
          scenes: syncList(project.act3.scenes),
        },
        act4: {
          ...project.act4,
          actDuration: '7 phút (27:00 - 34:00)',
          scenes: syncList(project.act4.scenes),
        },
      };

      onUpdateProject(updatedProject);
      showToast('Đã đồng bộ 100% ký tự cho toàn bộ 12 phân cảnh theo thời lượng dài nhất 34 phút!');
    } catch (err) {
      console.error(err);
      showToast('Không thể đồng bộ toàn bộ kịch bản.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const heroic = project.profile.heroicTragicRatio.heroicPercent;
  const tragic = project.profile.heroicTragicRatio.tragicPercent;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast banner */}
      {bannerToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm shadow-2xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2 border border-amber-300">
          <CheckCircle2 className="w-5 h-5 text-stone-950" />
          <span>{bannerToast}</span>
        </div>
      )}

      {/* QUICK CHARACTER INPUT & 100% CHÍNH SỬ AUTO-DISTRIBUTE BAR */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600/70 text-amber-300 text-[10px] font-mono font-bold">
                TÍNH CHÍNH SỬ 100%
              </span>
              <span className="text-xs text-stone-300 font-bold uppercase tracking-wider">
                Nhập Tên Nhân Vật Lịch Sử Để AI Phân Tích & Phân Bổ 6 Phần
              </span>
            </div>
            <p className="text-xs text-stone-400">
              AI sẽ phân tích toàn bộ thông tin chính sử, tạo "Cấu Trúc Mẫu Biên Kịch VO & Dialogue" và phân bổ đề xuất thẳng vào Lời Bình Giọng Đọc 6 Phần.
            </p>
          </div>

          <form onSubmit={handleQuickAnalyzeAndCreate} className="flex items-center gap-2 max-w-lg w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickCharacterName}
                onChange={(e) => setQuickCharacterName(e.target.value)}
                placeholder="Nhập tên nhân vật (vd: Trần Hưng Đạo, Quang Trung, Lý Thường Kiệt...)..."
                disabled={isQuickAnalyzing}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900/90 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isQuickAnalyzing || !quickCharacterName.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/60 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              {isQuickAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                  <span>Đang phân tích chính sử...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  <span>Phân Tích & Phân Bổ 6 Phần</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Studio Project Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-900/50 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-600/50 text-amber-300 font-semibold uppercase tracking-wider">
                {project.profile.era}
              </span>
              <span className="text-xs text-stone-400">
                Tạo ngày {project.createdAt}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Khung 4 Hồi Chuẩn 34 Phút</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-wide leading-tight">
              {project.title}
            </h1>

            <p className="text-sm text-stone-300 font-serif leading-relaxed line-clamp-2">
              <strong className="text-amber-300 font-sans">{project.profile.characterName}</strong> — {project.profile.lifePhilosophy}
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Ratio meter */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-amber-400">{heroic}% Hào Hùng</span>
                <span className="text-rose-400">{tragic}% Bi Kịch</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-stone-800">
                <div style={{ width: `${heroic}%` }} className="bg-amber-500" />
                <div style={{ width: `${tragic}%` }} className="bg-rose-600" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  34 phút (Tối đa 4 Hồi)
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {totalCharacters.toLocaleString('vi-VN')} ký tự
                </span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTeleprompter}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Phòng Thu Voice</span>
              </button>

              <button
                onClick={onExportMarkdown}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải Kịch Bản</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER 100% PACING AUDIT & GLOBAL CONTROLLER BAR */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-600/40 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                  Bộ Đo Lường Ăn Khớp 100% Ký Tự / Thời Lượng Dài Nhất
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold">
                  {overallMatchPct}% Hoàn Hảo
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tổng cộng <strong>{totalCharacters.toLocaleString('vi-VN')} ký tự</strong> (đếm từng chữ, số, dấu câu & khoảng trắng) trên chuẩn <strong>34 phút</strong> theo <strong>Cấu Trúc 6 Phần</strong>: Phần 1 (3p • 10-15%) • Phần 2 (5.5p • 15-20%) • Phần 3 (8.5p • 20-25%) • Phần 4 (6.75p • 15%) • Phần 5 (5.5p • 15%) • Phần 6 (4.75p • 10-15%).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPacingAudit(!showPacingAudit)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{showPacingAudit ? 'Ẩn Bảng Phân Bổ' : 'Bảng Phân Bổ 6 Phần'}</span>
              {showPacingAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleSyncAllScenesToMaxDuration}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/60 transition-all disabled:opacity-50"
              title="Đồng bộ toàn bộ 12 phân cảnh về thời lượng dài nhất (34 phút) và cân chỉnh ký tự ăn khớp 100%"
            >
              {isSyncingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              )}
              <span>{isSyncingAll ? 'Đang đồng bộ...' : '⚡ Đồng Bộ 100% Toàn Bộ 12 Phân Cảnh'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Allocation Audit Grid for 6 Parts */}
        {showPacingAudit && (
          <div className="pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {MASTER_SIX_PARTS_CONFIG.map((cfg) => {
              const sc1 = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === cfg.sceneNumbers[0]);
              const sc2 = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === cfg.sceneNumbers[1]);
              const totalPartChars = (sc1?.targetCharactersStandard || 0) + (sc2?.targetCharactersStandard || 0);

              return (
                <div key={cfg.partIndex} className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-amber-300 border-b border-stone-800 pb-1">
                    <span>{cfg.shortTitle}</span>
                    <span className="font-mono text-[11px] text-amber-400">{totalPartChars.toLocaleString('vi-VN')} kt</span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-mono">
                    • Sc #{sc1?.sceneNumber}: {sc1?.durationSeconds}s → {sc1?.targetCharactersStandard.toLocaleString('vi-VN')} kt ({sc1?.defaultTitle.slice(0, 24)}...)<br />
                    • Sc #{sc2?.sceneNumber}: {sc2?.durationSeconds}s → {sc2?.targetCharactersStandard.toLocaleString('vi-VN')} kt ({sc2?.defaultTitle.slice(0, 24)}...)
                  </p>
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-900">
                    <span>Chuẩn: {cfg.defaultDurationText}</span>
                    <span className="text-emerald-400 font-semibold">{cfg.durationPercentage} video</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'script'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6 Phần Kịch Bản Chuẩn Masterclass</span>
          </button>

          <button
            onClick={() => setActiveTab('director')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'director'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Đạo Diễn Visual & Story Beats</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Phòng Thu Âm (12 Nút Thắt)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ Sơ & Gói Sản Xuất</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'prompts'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Kho Prompt Video AI</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khung Kịch Bản Chuẩn</span>
          </button>
        </div>

        {/* Create new shortcut */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-amber-900/60 text-amber-300 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biên Kịch Nhân Vật Khác</span>
        </button>
      </div>

      {/* Tab 1: The 6 Parts Script View */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          {/* 6 Parts Main Filter Bar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-600/40 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-amber-200 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Cấu Trúc 6 Phần Chính Điện Ảnh (Chọn Phần Để Tập Trung Biên Kịch):</span>
              </span>
              {selectedPartFilter !== 'all' && (
                <button
                  onClick={() => setSelectedPartFilter('all')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Xem toàn bộ 6 Phần (12 Phân Cảnh)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MASTER_SIX_PARTS_CONFIG.map((cfg) => {
                const isSelected = selectedPartFilter === cfg.partIndex;
                return (
                  <button
                    key={cfg.partIndex}
                    onClick={() => setSelectedPartFilter(isSelected ? 'all' : cfg.partIndex)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/90 border-amber-400 shadow-lg shadow-amber-950/70 ring-1 ring-amber-400'
                        : 'bg-stone-900/80 border-stone-800 hover:border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400">PHẦN {cfg.partIndex}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-stone-950 text-stone-400 border border-stone-800">
                        {cfg.durationPercentage}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-100 mt-1 line-clamp-1">
                      {cfg.shortTitle.replace(/^[0-9]+\.\s*/, '')}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono mt-1">
                      Sc #{cfg.sceneNumbers[0]} & #{cfg.sceneNumbers[1]} • {cfg.defaultDurationText.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continuation Banner adhering strictly to core rule: write Parts 1 & 2 first, wait for user "Viết tiếp" to avoid AI truncation */}
          {(() => {
            const currentStage = project.generationProgress?.currentStage || 
              (project.act2?.scenes?.[0]?.narration?.includes('tránh AI cắt xén') ? 'parts_1_2_completed' : 'all_completed');

            if (currentStage === 'parts_1_2_completed') {
              return (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-2 border-amber-500 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-xs font-mono font-black uppercase">
                        QUY TẮC CỐT LÕI (BẮT BUỘC)
                      </span>
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                        Phần 1 & 2 Đã Viết Chi Tiết Tối Đa (~7.650 Ký Tự • 8.5 Phút)
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Hệ thống đang <strong>tạm dừng lại chờ bạn ra lệnh "Viết tiếp"</strong> để đảm bảo AI viết chi tiết tối đa theo chuẩn 900 ký tự/phút, tuyệt đối không tóm tắt hay cắt xén nội dung!
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => handleContinueWritingStage('parts_3_4')}
                      disabled={isContinuingStage}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs shadow-xl shadow-amber-950/70 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isContinuingStage ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-stone-950 text-stone-950" />
                      )}
                      <span>VIẾT TIẾP PHẦN 3 & 4 (Chi Tiết Tối Đa)</span>
                    </button>

                    <button
                      onClick={() => handleContinueWritingStage('all_remaining')}
                      disabled={isContinuingStage}
                      className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors disabled:opacity-50"
                    >
                      <span>Viết Tiếp Toàn Bộ Các Phần</span>
                    </button>
                  </div>
                </div>
              );
            }

            if (currentStage === 'parts_3_4_completed') {
              return (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-2 border-amber-500 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-xs font-mono font-black uppercase">
                        TIẾN TRÌNH: 4/6 PHẦN HOÀN TẤT
                      </span>
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                        Phần 1, 2, 3, 4 Đã Viết Chi Tiết (~19.500 Ký Tự • 23.75 Phút)
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Đang dừng lại chờ lệnh của bạn để viết tiếp <strong>Phần 5 & 6 (Điểm Mù Tai Họa & Sụp Đổ Bi Tráng)</strong> với đầy đủ hội thoại nhúng và mồi lửa cliffhanger!
                    </p>
                  </div>

                  <button
                    onClick={() => handleContinueWritingStage('parts_5_6')}
                    disabled={isContinuingStage}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs shadow-xl shadow-amber-950/70 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isContinuingStage ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    ) : (
                      <Play className="w-4 h-4 fill-stone-950 text-stone-950" />
                    )}
                    <span>VIẾT TIẾP PHẦN 5 & 6 (Hoàn Tất 34 Phút)</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/50 flex items-center justify-between gap-3 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Hoàn tất 100%:</strong> Toàn bộ 6 Phần (12 Phân Cảnh) đã được viết chi tiết tối đa (30-40 phút, 900 ký tự/phút) với hội thoại lồng ghép và mồi lửa cliffhanger liền mạch.
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Render the 6 Parts via PartCard */}
          {(() => {
            const sixParts = getSixPartsFromProject(project);
            const displayedParts = selectedPartFilter === 'all'
              ? sixParts
              : sixParts.filter((p) => p.partIndex === selectedPartFilter);

            return (
              <div className="space-y-8">
                {displayedParts.map((part) => (
                  <PartCard
                    key={part.partIndex}
                    partData={part}
                    characterName={project.profile.characterName}
                    onRefineScene={(sc) => setRefineTargetScene(sc)}
                    onUpdateScene={handleRefineSceneSuccess}
                    onContinuePart={(pIdx) => handleContinueWritingStage(pIdx <= 4 ? 'parts_3_4' : 'parts_5_6')}
                    isContinuing={isContinuingStage}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: Visual Director & Story Beats Studio */}
      {activeTab === 'director' && (
        <VisualDirectorStudio
          project={project}
          onUpdateProject={onUpdateProject}
        />
      )}

      {/* Tab: Audio Producer Studio & Voice Audition (12 Knots) */}
      {activeTab === 'audio' && (
        <AudioProducerStudioView
          project={project}
          onUpdateProject={onUpdateProject}
        />
      )}

      {/* Tab 3: Profile & Production Package */}
      {activeTab === 'profile' && (
        <CharacterProfileView
          profile={project.profile}
          production={project.production}
        />
      )}

      {/* Tab 3: Prompt Vault */}
      {activeTab === 'prompts' && (
        <PromptVaultView project={project} />
      )}

      {/* Tab 4: Framework Guide */}
      {activeTab === 'guide' && (
        <FrameworkGuideView />
      )}

      {/* Refine Scene Modal */}
      {refineTargetScene && (
        <RefineSceneModal
          scene={refineTargetScene}
          characterName={project.profile.characterName}
          isOpen={!!refineTargetScene}
          onClose={() => setRefineTargetScene(null)}
          onSuccess={(refined) => {
            handleRefineSceneSuccess(refined);
            setRefineTargetScene(null);
          }}
        />
      )}
    </main>
  );
};
