import React, { useState } from 'react';
import {
  Mic,
  ShieldCheck,
  Volume2,
  Play,
  Square,
  Sparkles,
  Layers,
  Compass,
  Gauge,
  Flame,
  Clock,
  BookOpen,
  Anchor,
  Crown,
  Skull,
  CheckCircle2,
  Download,
  Activity,
  Filter,
} from 'lucide-react';
import { MasterScriptProject, CinematicScene } from '../types/script';
import { MASTER_NARRATOR, getSceneKnotProfile, MasterUploadedVoice } from '../utils/audioAudition';
import { VoiceAuditionPlayer } from './VoiceAuditionPlayer';
import { MasterAudioUploader } from './MasterAudioUploader';

interface AudioProducerStudioViewProps {
  project: MasterScriptProject;
  onUpdateProject?: (updatedProject: MasterScriptProject) => void;
}

export const AudioProducerStudioView: React.FC<AudioProducerStudioViewProps> = ({
  project,
  onUpdateProject,
}) => {
  const [selectedAct, setSelectedAct] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [activeAuditionScene, setActiveAuditionScene] = useState<number | null>(1);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  const handleApplyToAllScenes = (voice: MasterUploadedVoice) => {
    if (!onUpdateProject) return;

    const updateScenes = (scenes: CinematicScene[]) =>
      scenes.map((scene) => {
        const knot = getSceneKnotProfile(scene.sceneNumber);
        return {
          ...scene,
          masterVoiceAttached: {
            fileName: voice.fileName,
            sourceType: 'master_mp3' as const,
            audioUrl: voice.audioUrl,
            timbre: voice.analyzedProfile?.timbre || 'Trầm ấm, uy nghiêm sử thi',
            appliedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            pacingCps: knot.recommendedCps,
          },
        };
      });

    const updatedProject: MasterScriptProject = {
      ...project,
      act1: { ...project.act1, scenes: updateScenes(project.act1.scenes) },
      act2: { ...project.act2, scenes: updateScenes(project.act2.scenes) },
      act3: { ...project.act3, scenes: updateScenes(project.act3.scenes) },
      act4: { ...project.act4, scenes: updateScenes(project.act4.scenes) },
    };

    onUpdateProject(updatedProject);
    setBannerToast(
      `Đã nạp thành công 100% giọng đọc từ file "${voice.fileName}" vào Lời Bình của tất cả 12 Scenes!`
    );
    setTimeout(() => setBannerToast(null), 4500);
  };

  // Collect all 12 scenes from 4 acts
  const allScenes: { scene: CinematicScene; actIndex: 1 | 2 | 3 | 4; actTitle: string }[] = [
    ...project.act1.scenes.map((s) => ({ scene: s, actIndex: 1 as const, actTitle: project.act1.actTitle })),
    ...project.act2.scenes.map((s) => ({ scene: s, actIndex: 2 as const, actTitle: project.act2.actTitle })),
    ...project.act3.scenes.map((s) => ({ scene: s, actIndex: 3 as const, actTitle: project.act3.actTitle })),
    ...project.act4.scenes.map((s) => ({ scene: s, actIndex: 4 as const, actTitle: project.act4.actTitle })),
  ];

  const filteredScenes = selectedAct === 'all'
    ? allScenes
    : allScenes.filter((s) => s.actIndex === selectedAct);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Audio Producer Master Control Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-600/70 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QUY ĐỊNH TUYỆT ĐỐI: 1 NGƯỜI DẪN CHUYỆN DUY NHẤT CHO CẢ 6 PHẦN CHÍNH</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-stone-900 border border-stone-800 text-stone-300">
                  100% Không Sai Khác Giọng Đọc
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-wide">
                Phòng Thu Âm Đạo Diễn & Diễn Viên Lồng Tiếng (Audio Producer Studio)
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed max-w-3xl">
                Quy trình "Đọc thử giọng" (Voice Audition/Preview) cho từng lời bình tương ứng với <strong>12 Nút Thắt kịch tính</strong> qua 6 Phần chính cuộc đời nhân vật <strong className="text-amber-300">{project.profile.characterName}</strong>. Mọi phân cảnh đều được kiểm soát bởi Giám đốc Âm thanh và thể hiện bởi một nghệ sĩ thuyết minh duy nhất.
              </p>
            </div>

            {/* Narrator Persona Card */}
            <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-600/50 space-y-2 min-w-[280px] shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-800 flex items-center justify-center border border-amber-400/40 text-stone-950 font-bold shadow-md">
                  <Mic className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-amber-200">
                    {MASTER_NARRATOR.name}
                  </h4>
                  <p className="text-[11px] text-emerald-400 font-mono font-medium">
                    {MASTER_NARRATOR.title}
                  </p>
                </div>
              </div>
              <div className="pt-1.5 border-t border-stone-800 text-[11px] text-stone-300 space-y-1">
                <div><strong>Âm vực:</strong> Baritone nam trầm sử thi chính luận</div>
                <div><strong>Khí chất:</strong> Trầm ấm, uy nghiêm, nội lực thâm hậu</div>
                <div className="text-emerald-300 font-mono text-[10px]">
                  ✓ Khóa cố định âm sắc xuyên suốt Hồi 1, 2, 3, 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification when Applied */}
      {bannerToast && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 text-stone-950 font-bold text-sm shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-stone-950 shrink-0" />
            <span>{bannerToast}</span>
          </div>
          <span className="text-xs bg-stone-950/20 px-2 py-0.5 rounded font-mono">100% Đồng Bộ</span>
        </div>
      )}

      {/* DEDICATED MASTER AUDIO IMPORT SECTION: 100% SAME VOICE FOR ALL 12 KNOTS */}
      <MasterAudioUploader
        characterName={project.profile.characterName}
        onApplyToAllScenes={handleApplyToAllScenes}
      />

      {/* Act Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Lọc Nút Thắt Theo Hồi:
          </span>
          <button
            onClick={() => setSelectedAct('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedAct === 'all'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất Cả 12 Nút Thắt
          </button>
          {[1, 2, 3, 4].map((actIdx) => (
            <button
              key={actIdx}
              onClick={() => setSelectedAct(actIdx as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedAct === actIdx
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              Hồi {actIdx}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-stone-400">
          Hiển thị <strong>{filteredScenes.length} / 12</strong> Nút Thắt Lời Bình
        </span>
      </div>

      {/* 12 Scenes Dramatic Knot Cards Grid */}
      <div className="space-y-6">
        {filteredScenes.map(({ scene, actIndex, actTitle }) => {
          const knot = getSceneKnotProfile(scene.sceneNumber);
          const isSelected = activeAuditionScene === scene.sceneNumber;

          return (
            <div
              key={scene.id || scene.sceneNumber}
              className={`rounded-2xl bg-stone-900/80 border transition-all p-5 sm:p-6 space-y-4 shadow-xl ${
                isSelected
                  ? 'border-amber-500 shadow-amber-950/40 ring-1 ring-amber-500/50'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Knot Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/50 flex items-center justify-center font-mono text-sm font-bold text-amber-300">
                    #{scene.sceneNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400">
                        {actTitle} ({scene.timestamp})
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {knot.recommendedCps} ký tự/giây
                      </span>
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                      {scene.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    {scene.narration.length} ký tự
                  </span>
                </div>
              </div>

              {/* Dramatic Knot Explanation */}
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{knot.knotName}</span>
                </div>
                <p className="text-stone-300 leading-relaxed font-serif pl-1">
                  <strong>Chỉ đạo diễn xuất giọng đọc:</strong> {knot.actingNote}
                </p>
                <p className="text-amber-200/90 font-mono text-[11px] pl-1">
                  <strong>Điểm lấy hơi & Ngắt câu:</strong> {knot.breathPoint}
                </p>
              </div>

              {/* Integrated Voice Audition Studio Player */}
              <VoiceAuditionPlayer
                text={scene.narration}
                sceneNumber={scene.sceneNumber}
                actNumber={actIndex}
                sceneTitle={scene.title}
                characterName={project.profile.characterName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
