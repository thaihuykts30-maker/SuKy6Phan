import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  Zap,
  Crown,
  EyeOff,
  BookOpen,
  Sparkles,
  Quote,
  Clock,
  MessageSquare,
  Mic,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import { PartSectionData, CinematicScene } from '../types/script';
import { SceneCard } from './SceneCard';

interface PartCardProps {
  partData: PartSectionData;
  characterName: string;
  onRefineScene: (scene: CinematicScene) => void;
  onUpdateScene?: (updatedScene: CinematicScene) => void;
  onContinuePart?: (partIndex: number) => void;
  isContinuing?: boolean;
}

export const PartCard: React.FC<PartCardProps> = ({
  partData,
  characterName,
  onRefineScene,
  onUpdateScene,
  onContinuePart,
  isContinuing = false,
}) => {
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getPartMeta = (index: number) => {
    switch (index) {
      case 1:
        return {
          icon: Flame,
          badgeColor: 'from-amber-600 to-red-600 text-amber-200 border-amber-500/50',
          borderColor: 'border-amber-600/60',
          accentBg: 'bg-amber-950/40',
          tagColor: 'text-amber-400',
        };
      case 2:
        return {
          icon: ShieldAlert,
          badgeColor: 'from-rose-700 to-red-900 text-rose-200 border-rose-500/50',
          borderColor: 'border-rose-600/60',
          accentBg: 'bg-rose-950/40',
          tagColor: 'text-rose-400',
        };
      case 3:
        return {
          icon: Zap,
          badgeColor: 'from-orange-600 to-amber-700 text-orange-200 border-orange-500/50',
          borderColor: 'border-orange-600/60',
          accentBg: 'bg-orange-950/40',
          tagColor: 'text-orange-400',
        };
      case 4:
        return {
          icon: Crown,
          badgeColor: 'from-yellow-500 to-amber-600 text-yellow-950 font-bold border-yellow-400/60',
          borderColor: 'border-yellow-500/60',
          accentBg: 'bg-yellow-950/40',
          tagColor: 'text-yellow-400',
        };
      case 5:
        return {
          icon: EyeOff,
          badgeColor: 'from-purple-700 to-stone-900 text-purple-200 border-purple-500/50',
          borderColor: 'border-purple-600/60',
          accentBg: 'bg-purple-950/40',
          tagColor: 'text-purple-400',
        };
      case 6:
        return {
          icon: BookOpen,
          badgeColor: 'from-emerald-700 to-teal-900 text-emerald-200 border-emerald-500/50',
          borderColor: 'border-emerald-600/60',
          accentBg: 'bg-emerald-950/40',
          tagColor: 'text-emerald-400',
        };
      default:
        return {
          icon: Sparkles,
          badgeColor: 'from-stone-700 to-stone-900 text-stone-200 border-stone-600/40',
          borderColor: 'border-stone-700/50',
          accentBg: 'bg-stone-950/40',
          tagColor: 'text-amber-400',
        };
    }
  };

  const meta = getPartMeta(partData.partIndex);
  const Icon = meta.icon;

  const copyFullFormula = () => {
    const text = `[${partData.partTitle}]\n- Mục tiêu: ${partData.objective}\n- VO: ${partData.sampleStructure.voFormula}\n- Hội thoại: ${partData.sampleStructure.dialogueFormula}\n- Outro VO: ${partData.sampleStructure.outroVoFormula}`;
    navigator.clipboard.writeText(text);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  return (
    <div className={`rounded-2xl bg-stone-900/80 border ${meta.borderColor} shadow-2xl p-5 sm:p-7 space-y-5 transition-all`}>
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.badgeColor} flex items-center justify-center border shadow-lg shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                {partData.partTitle}
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-amber-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{partData.partDuration}</span>
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 flex items-start gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Mục tiêu:</strong> {partData.objective}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Continue button if part is waiting */}
          {partData.scenes.some(s => (s.narration || '').includes('tránh AI cắt xén') || (s.narration || '').includes('tạm dừng ở Phần 1 & 2') || (s.narration || '').length < 350) && onContinuePart && (
            <button
              onClick={() => onContinuePart(partData.partIndex)}
              disabled={isContinuing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-bold shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
              title="Viết tiếp chi tiết tối đa cho phần này (không bị AI cắt xén)"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>{isContinuing ? 'Đang viết tiếp...' : '▶ Viết Tiếp Chi Tiết Phần Này'}</span>
            </button>
          )}

          <button
            onClick={() => setShowFormulaGuide(!showFormulaGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-medium transition-colors"
          >
            <Quote className="w-3.5 h-3.5 text-amber-400" />
            <span>{showFormulaGuide ? 'Ẩn Cấu Trúc Mẫu' : 'Xem Cấu Trúc Mẫu VO & Thoại'}</span>
            {showFormulaGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Sample Structure Box */}
      {showFormulaGuide && (
        <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-900/50 space-y-3.5 text-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Cấu Trúc Mẫu Biên Kịch (Voiceover & Dialogue) - Chính Sử: {characterName}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!onUpdateScene) return;
                  const mergedScript = `[VO DẪN]: ${partData.sampleStructure.voFormula}\n\n[HỘI THOẠI TRỰC TIẾP]: ${partData.sampleStructure.dialogueFormula}\n\n[VO PHÂN TÍCH TIẾP & CLIFFHANGER]: ${partData.sampleStructure.outroVoFormula}`;
                  partData.scenes.forEach((scene, idx) => {
                    onUpdateScene({
                      ...scene,
                      narration: idx === 0 
                        ? mergedScript 
                        : `${partData.sampleStructure.voFormula} ${characterName} quả quyết: "${(partData.sampleStructure.dialogueFormula.split('"')[1] || 'Quyết giữ vững khí phách!')}". ${partData.sampleStructure.outroVoFormula}`,
                      characterCount: mergedScript.length,
                    });
                  });
                  showToast(`Đã phân bổ đề xuất thẳng vào ${partData.scenes.length} phân cảnh thuộc ${partData.shortTitle}!`);
                }}
                className="text-stone-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded font-bold flex items-center gap-1 text-[11px] shadow-sm transition-all"
                title="Tự động phân bổ đề xuất thẳng vào Lời bình giọng đọc của các phân cảnh thuộc phần này"
              >
                <Sparkles className="w-3 h-3 text-stone-950" />
                <span>Phân Bổ Thẳng Vào Lời Bình Các Scene</span>
              </button>
              <button
                onClick={copyFullFormula}
                className="text-stone-400 hover:text-amber-300 flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded hover:bg-stone-800 transition-colors"
              >
                {copiedFormula ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFormula ? 'Đã sao chép' : 'Sao chép mẫu'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-bold text-amber-400 font-mono text-[11px]">[VO KỂ CHUYỆN]</span>
              <p className="text-stone-300 italic font-serif mt-0.5 leading-relaxed bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/60">
                "{partData.sampleStructure.voFormula}"
              </p>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
                Tông giọng: {partData.sampleStructure.voTone}
              </span>
            </div>

            <div>
              <span className="font-bold text-cyan-400 font-mono text-[11px]">[HỘI THOẠI TRỰC TIẾP]</span>
              <p className="text-stone-300 italic font-serif mt-0.5 leading-relaxed bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/60">
                {partData.sampleStructure.dialogueFormula}
              </p>
            </div>

            <div>
              <span className="font-bold text-amber-300 font-mono text-[11px]">[VO KẾT THÚC ĐOẠN]</span>
              <p className="text-stone-300 italic font-serif mt-0.5 leading-relaxed bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/60">
                "{partData.sampleStructure.outroVoFormula}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Render Scenes for this Part */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Phân Cảnh Thuộc {partData.shortTitle} ({partData.scenes.length} Scenes):</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            Chiếm chuẩn {partData.durationPercentage} thời lượng video
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {partData.scenes.map((scene) => (
            <SceneCard
              key={scene.id || scene.sceneNumber}
              scene={scene}
              actName={partData.partTitle}
              characterName={characterName}
              onRefineScene={onRefineScene}
              onUpdateScene={onUpdateScene}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
