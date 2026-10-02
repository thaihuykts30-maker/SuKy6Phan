import React, { useState } from 'react';
import {
  Film,
  Camera,
  Video,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Layers,
  FileText,
  Sliders,
  Play,
  Square,
  ArrowRight,
  Info,
  CheckCircle2,
  Wand2,
  Code,
  Download,
} from 'lucide-react';
import { MasterScriptProject, CinematicScene, StoryBeat } from '../types/script';
import { exportToStoryBeatsPromptSheet, downloadFile } from '../utils/export';

interface VisualDirectorStudioProps {
  project: MasterScriptProject;
  onUpdateProject: (updated: MasterScriptProject) => void;
}

export const VisualDirectorStudio: React.FC<VisualDirectorStudioProps> = ({
  project,
  onUpdateProject,
}) => {
  const [activeMode, setActiveMode] = useState<'project_scenes' | 'sandbox'>('project_scenes');
  const [selectedSceneNumber, setSelectedSceneNumber] = useState<number>(1);
  const [isGeneratingBeats, setIsGeneratingBeats] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Freeform Sandbox state
  const [customVoiceover, setCustomVoiceover] = useState<string>(
    'Hàng vạn quân lính đứng im lìm dưới màn sương đặc quánh. Không một tiếng động, nhưng sát khí ngút trời. Vị tướng già vuốt ngược lưỡi gươm, ánh mắt hắt lên tia lửa của ngọn đuốc mờ, báo hiệu một đêm không ngủ.'
  );
  const [customContext, setCustomContext] = useState<string>('Chiến trường cổ đại - Đêm trước giờ xung trận');
  const [customBeats, setCustomBeats] = useState<StoryBeat[] | null>(null);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);

  // Collect all scenes
  const allScenes: (CinematicScene & { actTitle: string; actIndex: number })[] = [
    ...project.act1.scenes.map((s) => ({ ...s, actTitle: project.act1.actTitle, actIndex: 1 })),
    ...project.act2.scenes.map((s) => ({ ...s, actTitle: project.act2.actTitle, actIndex: 2 })),
    ...project.act3.scenes.map((s) => ({ ...s, actTitle: project.act3.actTitle, actIndex: 3 })),
    ...project.act4.scenes.map((s) => ({ ...s, actTitle: project.act4.actTitle, actIndex: 4 })),
  ];

  const currentScene = allScenes.find((s) => s.sceneNumber === selectedSceneNumber) || allScenes[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Đã sao chép: ${label}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Story Beats for the currently selected scene in the project
  const handleGenerateSceneBeats = async () => {
    if (!currentScene) return;
    setIsGeneratingBeats(true);
    try {
      const response = await fetch('/api/generate-story-beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: project.profile.characterName,
          era: project.profile.era,
          sceneTitle: currentScene.title,
          narration: currentScene.narration,
          actName: currentScene.actTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('API server không thể phản hồi.');
      }

      const data = await response.json();
      if (data.storyBeats && data.storyBeats.length > 0) {
        const updatedScene: CinematicScene = {
          ...currentScene,
          storyBeats: data.storyBeats,
        };

        const updateList = (list: CinematicScene[]) =>
          list.map((s) => (s.sceneNumber === currentScene.sceneNumber ? updatedScene : s));

        const updatedProj: MasterScriptProject = {
          ...project,
          act1: { ...project.act1, scenes: updateList(project.act1.scenes) },
          act2: { ...project.act2, scenes: updateList(project.act2.scenes) },
          act3: { ...project.act3, scenes: updateList(project.act3.scenes) },
          act4: { ...project.act4, scenes: updateList(project.act4.scenes) },
        };

        onUpdateProject(updatedProj);
        showToast(`Đã tạo thành công 3 nút thắt Story Beats cho Scene #${currentScene.sceneNumber}!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Lỗi khi tạo nút thắt. Vui lòng thử lại.');
    } finally {
      setIsGeneratingBeats(false);
    }
  };

  // Analyze custom voice-over in sandbox mode
  const handleAnalyzeCustomVoiceover = async () => {
    if (!customVoiceover.trim()) {
      showToast('Vui lòng nhập đoạn lời bình cần phân tích.');
      return;
    }
    setIsGeneratingCustom(true);
    try {
      const res = await fetch('/api/breakdown-custom-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceoverText: customVoiceover,
          sceneContext: customContext,
          characterName: project.profile.characterName,
        }),
      });

      if (!res.ok) throw new Error('API server lỗi.');
      const data = await res.json();
      if (data.storyBeats) {
        setCustomBeats(data.storyBeats);
        showToast('Đã bóc tách thành công các nút thắt điện ảnh!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Không thể phân tích lời bình.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Export full Story Beats prompt vault
  const handleDownloadFullSheet = () => {
    const text = exportToStoryBeatsPromptSheet(project);
    downloadFile(
      `${project.profile.characterName.toLowerCase().replace(/\s+/g, '-')}-story-beats-vault.txt`,
      text,
      'text/plain'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl animate-in slide-in-from-bottom duration-150 flex items-center gap-2 border border-amber-300">
          <CheckCircle2 className="w-4 h-4 text-stone-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Studio Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-800/60 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-600/50 text-cyan-300 font-semibold uppercase tracking-wider">
                VISUAL DIRECTOR & PROMPT ENGINEER
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-semibold">
                STORY BEATS ARCHITECTURE
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-100 flex items-center gap-2">
              <Film className="w-6 h-6 text-amber-400" />
              <span>Xưởng Đạo Diễn Hình Ảnh & Kỹ Sư Câu Lệnh Video AI</span>
            </h2>
            <p className="text-xs text-stone-400 max-w-3xl leading-relaxed">
              Bóc tách từng đoạn <strong>Lời bình giọng đọc</strong> thành các <strong>Nút thắt (Story Beats)</strong> cảm xúc.
              Tự động khởi tạo <strong>Image Prompt (Midjourney/Flux)</strong> và <strong>Video Motion Prompt (Runway Gen-3/Kling/Veo/Sora)</strong> chuẩn cú pháp đạo diễn kèm ghi chú lý do điện ảnh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadFullSheet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/70 text-stone-200 text-xs font-medium transition-colors"
              title="Tải toàn bộ hồ sơ Story Beats cho 12 phân cảnh"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Xuất Hồ Sơ Nút Thắt (.txt)</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-stone-800/80">
          <button
            onClick={() => setActiveMode('project_scenes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'project_scenes'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>12 Phân Cảnh Trong Kịch Bản ({project.profile.characterName})</span>
          </button>

          <button
            onClick={() => setActiveMode('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'sandbox'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Xưởng Đạo Diễn Tự Do (Nhập Lời Bình Bất Kỳ)</span>
          </button>
        </div>
      </div>

      {/* PROMPT ARCHITECTURE GUIDE: PHẦN 1 CẤU TRÚC PROMPT TỐI ƯU CHO HÌNH ẢNH SẮC NÉT */}
      <div className="rounded-xl bg-stone-900/90 border border-emerald-800/60 p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
              <span>PHẦN 1: CẤU TRÚC PROMPT TỐI ƯU CHO HÌNH ẢNH SẮC NÉT</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/70 text-emerald-300 font-bold">
                CHUẨN YOUTUBE 16:9
              </span>
            </h3>
          </div>
          <button
            onClick={() => {
              const template = `[Chủ Thể Chính & Hành Động] + [Chi Tiết Trang Phục Lịch Sử] + [Môi Trường & Bối Cảnh] + [Góc Quay & Bố Cục] + [Ánh Sáng & Tâm Trạng] + 8k, hyper-detailed, photorealistic, highly detailed, intricate detail, DSLR, 35mm lens, sharp focus, crystal clear, professional photography, candid style, detailed skin texture, pore-level detail, individual fabric weave, scratched metal texture, dynamic range --ar 16:9`;
              copyText(template, 'template-copy', 'Khuôn mẫu prompt sắc nét chuẩn');
            }}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-stone-950 px-3 py-1 rounded-md border border-emerald-800/60 hover:border-emerald-600 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Sao Chép Khuôn Mẫu (Template)</span>
          </button>
        </div>

        {/* 6-Part Architecture Formula */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
            1. Khuôn Mẫu Prompt Tổng Quát (Template 6 Thành Tố):
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded bg-stone-950 border border-amber-600/60 text-amber-300 font-semibold">
              [Chủ Thể & Hành Động]
            </span>
            <span className="text-stone-500 font-bold">+</span>
            <span className="px-2.5 py-1 rounded bg-stone-950 border border-purple-600/60 text-purple-300 font-semibold">
              [Chi Tiết Trang Phục Lịch Sử]
            </span>
            <span className="text-stone-500 font-bold">+</span>
            <span className="px-2.5 py-1 rounded bg-stone-950 border border-cyan-600/60 text-cyan-300 font-semibold">
              [Môi Trường & Bối Cảnh]
            </span>
            <span className="text-stone-500 font-bold">+</span>
            <span className="px-2.5 py-1 rounded bg-stone-950 border border-blue-600/60 text-blue-300 font-semibold">
              [Góc Quay & Bố Cục]
            </span>
            <span className="text-stone-500 font-bold">+</span>
            <span className="px-2.5 py-1 rounded bg-stone-950 border border-yellow-600/60 text-yellow-300 font-semibold">
              [Ánh Sáng & Tâm Trạng]
            </span>
            <span className="text-stone-500 font-bold">+</span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold shadow-sm">
              [TỪ KHÓA CHẤT LƯỢNG CAO PHẢI CÓ]
            </span>
          </div>
        </div>

        {/* 4 Mandatory Quality Keyword Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 block font-mono">
              ✨ Độ Sắc Nét & Chi Tiết:
            </span>
            <p className="text-[11px] font-mono text-stone-200 leading-snug">
              8k, hyper-detailed, photorealistic, highly detailed, intricate detail
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 block font-mono">
              📷 Ống Kính & Quang Học:
            </span>
            <p className="text-[11px] font-mono text-stone-200 leading-snug">
              DSLR, 35mm lens, sharp focus, crystal clear, professional photography, candid style
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 block font-mono">
              🔬 Kết Cấu Siêu Thực (Texture):
            </span>
            <p className="text-[11px] font-mono text-stone-200 leading-snug">
              detailed skin texture, pore-level detail, individual fabric weave, scratched metal texture, dynamic range
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 block font-mono">
              📺 Tỷ Lệ Chuẩn YouTube:
            </span>
            <p className="text-[11px] font-mono text-stone-200 leading-snug">
              --ar 16:9 (Chuẩn Thumbnail & Khung hình tư liệu 4K)
            </p>
          </div>
        </div>
      </div>

      {/* MODE 1: PROJECT SCENES STORY BEATS */}
      {activeMode === 'project_scenes' && (
        <div className="space-y-6">
          {/* Scene Selector Strip */}
          <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
              <span>Chọn phân cảnh cần đạo diễn hình ảnh:</span>
              <span className="text-amber-400 font-mono text-[11px]">
                {currentScene.actTitle} • Scene #{currentScene.sceneNumber} ({currentScene.timestamp})
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {allScenes.map((s) => {
                const isSelected = s.sceneNumber === selectedSceneNumber;
                const hasBeats = Boolean(s.storyBeats && s.storyBeats.length > 0);
                return (
                  <button
                    key={s.id || s.sceneNumber}
                    onClick={() => setSelectedSceneNumber(s.sceneNumber)}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-950/60'
                        : hasBeats
                        ? 'bg-stone-950 border-emerald-800/60 text-emerald-300 hover:border-emerald-600'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">#{s.sceneNumber}</span>
                    <span className="text-[9px] font-mono opacity-80 truncate max-w-full">
                      H{s.actIndex}
                    </span>
                    {hasBeats && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" title="Đã có 3 nút thắt" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Scene Detail & Voiceover */}
          <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                  {currentScene.actTitle}
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-100">
                  Scene #{currentScene.sceneNumber}: {currentScene.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateSceneBeats}
                  disabled={isGeneratingBeats}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  title="Nhờ Chuyên gia AI bóc tách 3 nút thắt điện ảnh"
                >
                  {isGeneratingBeats ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  )}
                  <span>{isGeneratingBeats ? 'Đang phân tích...' : '🎬 Bóc Tách 3 Nút Thắt Bằng AI'}</span>
                </button>
              </div>
            </div>

            {/* Voiceover Text Display */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
                Lời Bình Giọng Đọc Của Phân Cảnh (Voice-over Script):
              </span>
              <div className="p-4 rounded-lg bg-stone-950/80 border border-stone-800 text-stone-200 text-sm font-serif italic leading-relaxed whitespace-pre-line border-l-2 border-l-amber-500">
                "{currentScene.narration}"
              </div>
            </div>

            {/* Render Story Beats for current scene */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Các Nút Thắt Điện Ảnh (Story Beats):</span>
                </h4>
                {currentScene.storyBeats && currentScene.storyBeats.length > 0 && (
                  <button
                    onClick={() => {
                      const text = currentScene.storyBeats!
                        .map(
                          (b) =>
                            `${b.title}\n🎙️ Lời bình: "${b.voiceoverExcerpt}"\n📸 Image Prompt: ${b.imagePrompt}\n🎥 Video Motion Prompt: ${b.videoMotionPrompt}\n(Ghi chú đạo diễn: ${b.directorNote})\n`
                        )
                        .join('\n');
                      copyText(text, `scene-${currentScene.sceneNumber}-all`, 'Toàn bộ 3 Nút Thắt');
                    }}
                    className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Chép Toàn Bộ 3 Nút Thắt</span>
                  </button>
                )}
              </div>

              {currentScene.storyBeats && currentScene.storyBeats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {currentScene.storyBeats.map((beat, idx) => (
                    <StoryBeatCard
                      key={beat.id || idx}
                      beat={beat}
                      onCopy={copyText}
                      copiedId={copiedId}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-stone-950/60 border border-dashed border-stone-800 p-8 text-center space-y-3">
                  <Camera className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-stone-400 text-xs max-w-md mx-auto">
                    Phân cảnh này chưa được chia thành 3 nút thắt chuyên sâu. Hãy bấm nút bên dưới để Chuyên gia Đạo diễn AI bóc tách lời bình thành 3 Nút thắt chuẩn điện ảnh kèm Image Prompt và Video Motion Prompt.
                  </p>
                  <button
                    onClick={handleGenerateSceneBeats}
                    disabled={isGeneratingBeats}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-all"
                  >
                    {isGeneratingBeats ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Bóc Tách Nút Thắt & Khởi Tạo Prompts Ngay</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FREEFORM SANDBOX */}
      {activeMode === 'sandbox' && (
        <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <span>Xưởng Đạo Diễn Tự Do (Prompt Engineering Sandbox)</span>
            </h3>
            <p className="text-xs text-stone-400">
              Nhập bất kỳ đoạn lời bình tài liệu lịch sử nào để hệ thống tự động bóc tách thành các Nút thắt (Story Beats) và viết câu lệnh chuẩn Midjourney / Runway Gen-3.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-stone-300">
                  Đoạn Lời Bình Giọng Đọc (Voice-over):
                </label>
                <button
                  onClick={() => {
                    setCustomVoiceover(
                      'Hàng vạn quân lính đứng im lìm dưới màn sương đặc quánh. Không một tiếng động, nhưng sát khí ngút trời. Vị tướng già vuốt ngược lưỡi gươm, ánh mắt hắt lên tia lửa của ngọn đuốc mờ, báo hiệu một đêm không ngủ.'
                    );
                    setCustomContext('Chiến trường cổ đại - Đêm trước giờ xuất quân');
                    showToast('Đã nạp văn bản mẫu');
                  }}
                  className="text-amber-400 hover:text-amber-300 underline text-[11px]"
                >
                  Nạp ví dụ mẫu
                </button>
              </div>
              <textarea
                rows={4}
                value={customVoiceover}
                onChange={(e) => setCustomVoiceover(e.target.value)}
                placeholder="Dán đoạn lời bình lịch sử tại đây..."
                className="w-full p-3.5 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-100 text-xs sm:text-sm font-serif leading-relaxed outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:flex-1 space-y-1">
                <label className="text-xs font-semibold text-stone-300">
                  Ghi chú bối cảnh / nhân vật (tùy chọn):
                </label>
                <input
                  type="text"
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="Ví dụ: Khởi nghĩa Lam Sơn, Trận Đống Đa, Chiến trường cổ đại..."
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleAnalyzeCustomVoiceover}
                disabled={isGeneratingCustom}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
              >
                {isGeneratingCustom ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Sparkles className="w-4 h-4 text-stone-950" />
                )}
                <span>{isGeneratingCustom ? 'Đang Đạo Diễn...' : '🎬 Bóc Tách Nút Thắt & Tạo Prompts'}</span>
              </button>
            </div>
          </div>

          {/* Results display */}
          {customBeats && customBeats.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-emerald-400">
                  Kết Quả Bóc Tách ({customBeats.length} Nút Thắt):
                </h4>
                <button
                  onClick={() => {
                    const text = customBeats
                      .map(
                        (b) =>
                          `${b.title}\n🎙️ Lời bình: "${b.voiceoverExcerpt}"\n📸 Image Prompt: ${b.imagePrompt}\n🎥 Video Motion Prompt: ${b.videoMotionPrompt}\n(Ghi chú đạo diễn: ${b.directorNote})\n`
                      )
                      .join('\n');
                    copyText(text, 'custom-all', 'Toàn bộ Nút Thắt');
                  }}
                  className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Sao chép toàn bộ kết quả</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {customBeats.map((beat, idx) => (
                  <StoryBeatCard
                    key={beat.id || idx}
                    beat={beat}
                    onCopy={copyText}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Subcomponent: StoryBeatCard
interface StoryBeatCardProps {
  beat: StoryBeat;
  onCopy: (text: string, id: string, label: string) => void;
  copiedId: string | null;
}

const StoryBeatCard: React.FC<StoryBeatCardProps> = ({ beat, onCopy, copiedId }) => {
  const getBadgeColor = () => {
    if (beat.type === 'opening' || beat.beatNumber === 1) return 'bg-amber-950/80 border-amber-600/50 text-amber-300';
    if (beat.type === 'climax' || beat.beatNumber === 2) return 'bg-rose-950/80 border-rose-600/50 text-rose-300';
    return 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300';
  };

  return (
    <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 space-y-3.5 shadow-md">
      {/* Beat Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor()}`}>
            {beat.title || `Nút thắt ${beat.beatNumber}`}
          </span>
        </div>
        <button
          onClick={() => {
            const formatted = `${beat.title}\n🎙️ Lời bình: "${beat.voiceoverExcerpt}"\n📸 Image Prompt (EN): ${beat.imagePrompt}\n🎥 Video Motion Prompt (EN): ${beat.videoMotionPrompt}\n(Ghi chú đạo diễn: ${beat.directorNote})`;
            onCopy(formatted, beat.id || `beat-${beat.beatNumber}`, 'Toàn bộ nút thắt');
          }}
          className="text-stone-400 hover:text-amber-300 text-[11px] flex items-center gap-1 transition-colors"
        >
          {copiedId === (beat.id || `beat-${beat.beatNumber}`) ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>Sao chép nút thắt này</span>
        </button>
      </div>

      {/* Voice-over Excerpt */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
          <span>🎙️ Lời bình (Voice-over):</span>
        </span>
        <p className="p-3 rounded-lg bg-stone-900/70 border border-stone-800/80 text-stone-200 text-xs font-serif italic leading-relaxed">
          "{beat.voiceoverExcerpt}"
        </p>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Image Prompt */}
        <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/90 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Image Prompt (Midjourney / Flux):
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 font-bold">
                --ar 16:9
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onCopy(beat.imagePrompt, `${beat.id}-img`, 'Image Prompt chuẩn 16:9')}
                className="text-stone-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 transition-colors"
              >
                {copiedId === `${beat.id}-img` ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedId === `${beat.id}-img` ? 'Đã chép' : 'Chép Prompt'}</span>
              </button>

              <button
                onClick={() => {
                  let prompt = beat.imagePrompt;
                  if (!prompt.includes('--v 6.1')) {
                    prompt = `${prompt.replace(/--ar\s+16:9/g, '').trim()} --v 6.1 --style raw --ar 16:9`;
                  }
                  onCopy(prompt, `${beat.id}-mj`, 'Prompt Midjourney v6.1');
                }}
                className="text-stone-400 hover:text-amber-300 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-950 border border-amber-900/50 transition-colors"
                title="Sao chép có kèm tham số tối ưu Midjourney v6.1 raw"
              >
                {copiedId === `${beat.id}-mj` ? (
                  <Check className="w-3 h-3 text-amber-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>{copiedId === `${beat.id}-mj` ? 'Đã chép v6.1' : '+ MJ v6.1'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs font-mono text-stone-300 select-all leading-normal break-words bg-stone-950/80 p-2.5 rounded border border-stone-800/90">
            {beat.imagePrompt}
          </p>
        </div>

        {/* Video Motion Prompt */}
        <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Video Motion Prompt (Runway / Kling / Sora):</span>
            </span>
            <button
              onClick={() => onCopy(beat.videoMotionPrompt, `${beat.id}-vid`, 'Video Motion Prompt')}
              className="text-stone-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
            >
              {copiedId === `${beat.id}-vid` ? (
                <Check className="w-3 h-3 text-cyan-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedId === `${beat.id}-vid` ? 'Đã chép' : 'Chép Prompt'}</span>
            </button>
          </div>
          <p className="text-xs font-mono text-stone-300 select-all leading-normal break-words bg-stone-950/80 p-2.5 rounded border border-stone-800/90">
            {beat.videoMotionPrompt}
          </p>
        </div>
      </div>

      {/* Director Note */}
      {beat.directorNote && (
        <div className="flex items-start gap-2 text-xs text-stone-300 bg-stone-900/50 p-2.5 rounded-lg border border-amber-900/30">
          <span className="text-amber-400 font-semibold shrink-0">🎬 Ghi chú đạo diễn:</span>
          <span className="italic">{beat.directorNote}</span>
        </div>
      )}
    </div>
  );
};
