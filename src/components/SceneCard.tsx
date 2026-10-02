import React, { useState } from 'react';
import {
  Copy,
  Check,
  Play,
  Square,
  Wand2,
  Volume2,
  Video,
  Image as ImageIcon,
  Gauge,
  Clock,
  Sparkles,
  Edit3,
  Save,
  X,
  RefreshCw,
  Info,
  CheckCircle2,
  Link2,
  Film,
  Camera,
  ChevronDown,
  ChevronUp,
  Mic,
  ShieldCheck,
  Music,
  Compass,
} from 'lucide-react';
import { CinematicScene, StoryBeat } from '../types/script';
import {
  analyzePacing,
  DEFAULT_CHARS_PER_SECOND,
  getMasterSceneAllocation,
  fineTuneNarrationTo100Percent,
  getChronologicalPhaseByScene,
} from '../utils/pacing';
import { VoiceAuditionPlayer } from './VoiceAuditionPlayer';
import { UnifiedAudioAuditionEngine, getSceneKnotProfile } from '../utils/audioAudition';

interface SceneCardProps {
  scene: CinematicScene;
  actName: string;
  actIndex?: number;
  characterName: string;
  onRefineScene: (scene: CinematicScene) => void;
  onUpdateScene?: (updatedScene: CinematicScene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  actName,
  actIndex = 1,
  characterName,
  onRefineScene,
  onUpdateScene,
}) => {
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [copiedNarration, setCopiedNarration] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAutoFitting, setIsAutoFitting] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineText, setInlineText] = useState(scene.narration);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showStoryBeats, setShowStoryBeats] = useState(false);
  const [isGeneratingBeats, setIsGeneratingBeats] = useState(false);
  const [showAuditionStudio, setShowAuditionStudio] = useState(true);

  // Master allocation for this scene
  const masterAlloc = getMasterSceneAllocation(scene.sceneNumber);

  // Analyze character count & pacing (use master allocation duration if not specified)
  const activeNarration = isEditingInline ? inlineText : scene.narration;
  const pacing = analyzePacing(
    activeNarration,
    scene.timestamp || masterAlloc.timestamp,
    DEFAULT_CHARS_PER_SECOND
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, type: 'img' | 'vid' | 'nar') => {
    navigator.clipboard.writeText(text);
    if (type === 'img') {
      setCopiedImage(true);
      showToast('Đã sao chép Prompt hình ảnh (Midjourney/Flux)');
      setTimeout(() => setCopiedImage(false), 2000);
    } else if (type === 'vid') {
      setCopiedVideo(true);
      showToast('Đã sao chép Prompt video (Kling/Runway/Veo)');
      setTimeout(() => setCopiedVideo(false), 2000);
    } else {
      setCopiedNarration(true);
      showToast('Đã sao chép Lời bình giọng đọc');
      setTimeout(() => setCopiedNarration(false), 2000);
    }
  };

  // Browser Web Speech API for voiceover trial
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt chưa hỗ trợ Web Speech API.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = isEditingInline ? inlineText : scene.narration;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Auto-fit 100% character count to exact longest duration of this scene
  const handleAutoFitDuration = async () => {
    setIsAutoFitting(true);
    try {
      // Call server auto-fit API
      const response = await fetch('/api/auto-fit-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName,
          scene,
          targetDurationSeconds: masterAlloc.durationSeconds,
          speechRateCps: DEFAULT_CHARS_PER_SECOND,
        }),
      });

      if (!response.ok) {
        throw new Error('API server gặp sự cố khi cân chỉnh.');
      }

      const data = await response.json();
      if (data.scene && onUpdateScene) {
        onUpdateScene(data.scene);
        setInlineText(data.scene.narration);
        showToast(`Đã cân chỉnh ăn khớp 100% (${data.scene.characterCount} ký tự cho ${masterAlloc.durationSeconds}s)!`);
      }
    } catch (err: any) {
      console.warn('API error, applying client-side high-precision tuning fallback:', err);
      // Fallback: client-side fine-tuning
      const tunedText = fineTuneNarrationTo100Percent(
        scene.narration,
        masterAlloc.durationSeconds,
        DEFAULT_CHARS_PER_SECOND
      );
      const updatedScene: CinematicScene = {
        ...scene,
        timestamp: masterAlloc.timestamp,
        durationSeconds: masterAlloc.durationSeconds,
        narration: tunedText,
        characterCount: tunedText.length,
        targetCharacterCount: masterAlloc.targetCharactersStandard,
        matchPercentage: Math.round((tunedText.length / masterAlloc.targetCharactersStandard) * 100),
      };
      if (onUpdateScene) {
        onUpdateScene(updatedScene);
        setInlineText(tunedText);
      }
      showToast(`Đã cân chỉnh văn phong đạt chuẩn ${tunedText.length} ký tự!`);
    } finally {
      setIsAutoFitting(false);
    }
  };

  const handleGenerateBeats = async () => {
    setIsGeneratingBeats(true);
    try {
      const response = await fetch('/api/generate-story-beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName,
          sceneTitle: scene.title,
          narration: isEditingInline ? inlineText : scene.narration,
          actName,
        }),
      });

      if (!response.ok) {
        throw new Error('API server không phản hồi.');
      }

      const data = await response.json();
      if (data.storyBeats && onUpdateScene) {
        const updated: CinematicScene = {
          ...scene,
          storyBeats: data.storyBeats,
        };
        onUpdateScene(updated);
        showToast('Đã bóc tách 3 nút thắt Story Beats thành công!');
        setShowStoryBeats(true);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Không thể tạo nút thắt. Vui lòng thử lại.');
    } finally {
      setIsGeneratingBeats(false);
    }
  };

  const handleSaveInlineEdit = () => {
    if (onUpdateScene) {
      const updated: CinematicScene = {
        ...scene,
        narration: inlineText,
        characterCount: inlineText.length,
        targetCharacterCount: pacing.targetCharCount,
        matchPercentage: pacing.matchPercentage,
      };
      onUpdateScene(updated);
      showToast('Đã lưu nội dung lời bình.');
    }
    setIsEditingInline(false);
  };

  const handleCancelInlineEdit = () => {
    setInlineText(scene.narration);
    setIsEditingInline(false);
  };

  // Status color styles
  const getBadgeStyle = () => {
    if (pacing.status === 'perfect') {
      return {
        badge: 'bg-emerald-950/90 border-emerald-600/70 text-emerald-300',
        bar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400',
        text: 'text-emerald-400',
      };
    }
    if (pacing.matchPercentage >= 85 && pacing.matchPercentage <= 115) {
      return {
        badge: 'bg-amber-950/90 border-amber-600/70 text-amber-300',
        bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        text: 'text-amber-400',
      };
    }
    return {
      badge: 'bg-rose-950/90 border-rose-600/70 text-rose-300',
      bar: 'bg-gradient-to-r from-rose-600 to-rose-400',
      text: 'text-rose-400',
    };
  };

  const style = getBadgeStyle();
  const chrono = getChronologicalPhaseByScene(scene.sceneNumber);

  return (
    <div className="rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-700/60 shadow-xl p-5 transition-all space-y-4 relative">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-20 px-3 py-1.5 rounded-lg bg-amber-600 text-stone-950 font-bold text-xs shadow-lg animate-in fade-in duration-150 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scene Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
            #{scene.sceneNumber}
          </span>
          <h4 className="font-serif text-stone-100 font-bold text-sm sm:text-base">
            {scene.title}
          </h4>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${chrono.badgeClass} flex items-center gap-1 font-semibold`}
            title={`${chrono.stageName}: ${chrono.tagline}`}
          >
            <Compass className="w-3 h-3" />
            <span>{chrono.label}</span>
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-amber-300/90 font-semibold"
            title={masterAlloc.partTitle}
          >
            Phần {masterAlloc.partIndex} ({masterAlloc.partPercentage})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timestamp badge */}
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{scene.timestamp || masterAlloc.timestamp} ({pacing.durationSeconds}s)</span>
          </span>

          {scene.pacingNote && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-300 flex items-center gap-1 hidden md:flex">
              <Gauge className="w-3 h-3 text-amber-400" />
              <span>{scene.pacingNote}</span>
            </span>
          )}

          <button
            onClick={() => setShowStoryBeats(!showStoryBeats)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors border ${
              showStoryBeats
                ? 'bg-amber-600 text-stone-950 font-bold border-amber-500 shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
            }`}
            title="Xem hoặc bóc tách 3 nút thắt Story Beats cho phân cảnh này"
          >
            <Film className="w-3 h-3 text-amber-400" />
            <span>3 Nút Thắt Visual</span>
            {scene.storyBeats && scene.storyBeats.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onRefineScene(scene)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-amber-950/70 border border-stone-700/60 hover:border-amber-700/60 text-stone-300 hover:text-amber-300 text-xs transition-colors"
            title="Nhờ Chuyên gia AI tinh chỉnh phân cảnh này"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Tinh Chỉnh AI</span>
          </button>
        </div>
      </div>

      {/* DEDICATED CHARACTER COUNT & 100% PACING SYNCHRONIZER BAR */}
      <div className="p-3.5 rounded-xl bg-stone-950/95 border border-stone-800/90 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono text-[11px] font-semibold">TỔNG KÝ TỰ:</span>
            <span className="font-mono font-bold text-stone-100 text-sm">
              {pacing.exactCharCount.toLocaleString('vi-VN')}
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              / Mục tiêu {pacing.targetCharCount.toLocaleString('vi-VN')} ({pacing.durationSeconds}s @ 13 cps)
            </span>

            {/* Toggle breakdown button */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[10px] text-amber-400/80 hover:text-amber-300 underline flex items-center gap-0.5 ml-1"
              title="Xem bóc tách chi tiết từng chữ cái, số, dấu câu và khoảng trắng"
            >
              <Info className="w-3 h-3" />
              <span>{showBreakdown ? 'Ẩn chi tiết' : 'Chi tiết ký tự'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Match badge */}
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1.5 shadow-sm ${style.badge}`}
            >
              {pacing.status === 'perfect' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Gauge className="w-3.5 h-3.5" />
              )}
              <span>{pacing.matchPercentage}% ({pacing.statusText})</span>
            </span>

            {/* Auto fit 100% button */}
            <button
              onClick={handleAutoFitDuration}
              disabled={isAutoFitting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-[11px] font-bold shadow-md shadow-amber-950/60 transition-all disabled:opacity-50"
              title="Cân chỉnh số lượng ký tự (chữ, số, dấu câu, khoảng trắng) ăn khớp 100% với thời lượng dài nhất phân bổ"
            >
              {isAutoFitting ? (
                <RefreshCw className="w-3 h-3 animate-spin text-stone-950" />
              ) : (
                <Sparkles className="w-3 h-3 text-stone-950" />
              )}
              <span>{isAutoFitting ? 'Đang cân chỉnh...' : '⚡ Cân Khớp 100% Ký Tự'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Character Breakdown Panel */}
        {showBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800 text-[11px] font-mono animate-in fade-in duration-150">
            <div className="p-1.5 rounded bg-stone-900/80 border border-stone-800/80 text-stone-300">
              <span className="text-stone-500 block text-[10px]">Chữ cái (Letters):</span>
              <strong className="text-stone-100">{pacing.breakdown.letters.toLocaleString('vi-VN')}</strong>
            </div>
            <div className="p-1.5 rounded bg-stone-900/80 border border-stone-800/80 text-stone-300">
              <span className="text-stone-500 block text-[10px]">Con số (Digits):</span>
              <strong className="text-stone-100">{pacing.breakdown.digits.toLocaleString('vi-VN')}</strong>
            </div>
            <div className="p-1.5 rounded bg-stone-900/80 border border-stone-800/80 text-stone-300">
              <span className="text-stone-500 block text-[10px]">Dấu câu (Punctuation):</span>
              <strong className="text-stone-100">{pacing.breakdown.punctuation.toLocaleString('vi-VN')}</strong>
            </div>
            <div className="p-1.5 rounded bg-stone-900/80 border border-stone-800/80 text-stone-300">
              <span className="text-stone-500 block text-[10px]">Khoảng trắng (Spaces):</span>
              <strong className="text-stone-100">{pacing.breakdown.whitespace.toLocaleString('vi-VN')}</strong>
            </div>
          </div>
        )}

        {/* Visual Progress Bar (Target 100%) */}
        <div className="relative h-2 w-full rounded-full bg-stone-800/80 overflow-hidden">
          <div
            style={{ width: `${Math.min(100, pacing.matchPercentage)}%` }}
            className={`h-full ${style.bar} transition-all duration-300`}
          />
        </div>
      </div>

      {/* Voiceover Narration Script Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Lời Bình Giọng Đọc (Voiceover Script):
          </span>
          <div className="flex items-center gap-2">
            {!isEditingInline ? (
              <button
                onClick={() => setIsEditingInline(true)}
                className="text-stone-400 hover:text-amber-300 text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                title="Chỉnh sửa trực tiếp từng từ để căn khớp ký tự"
              >
                <Edit3 className="w-3 h-3" />
                <span>Sửa Chữ Trực Tiếp</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveInlineEdit}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Lưu Lời Bình</span>
                </button>
                <button
                  onClick={handleCancelInlineEdit}
                  className="text-stone-400 hover:text-stone-200 text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Hủy</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowAuditionStudio(!showAuditionStudio)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                showAuditionStudio
                  ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-md shadow-amber-950/50'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-amber-300'
              }`}
              title="Mở phòng thu âm và nghe thử giọng đọc đạo diễn (Khóa 1 người dẫn chuyện duy nhất Vũ Hùng)"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{showAuditionStudio ? 'Đang Mở Phòng Thu' : 'Đọc Thử Giọng (Vũ Hùng)'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(isEditingInline ? inlineText : scene.narration, 'nar')}
              className="text-stone-400 hover:text-amber-300 text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
            >
              {copiedNarration ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedNarration ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* APPLIED MASTER MP3 VOICE BADGE & QUICK PLAY */}
        {(scene.masterVoiceAttached || UnifiedAudioAuditionEngine.getInstance().getMasterUploadedVoice()) && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 shadow-md">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-emerald-300 font-bold text-xs">
                    ĐÃ NẠP GIỌNG ĐỌC MP3 GỐC: {scene.masterVoiceAttached?.fileName || UnifiedAudioAuditionEngine.getInstance().getMasterUploadedVoice()?.fileName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/80 text-emerald-200 border border-emerald-600/60">
                    100% Đồng nhất 4 Hồi
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Tốc độ chuẩn: <strong className="text-amber-300">{getSceneKnotProfile(scene.sceneNumber).recommendedCps} cps</strong> • {getSceneKnotProfile(scene.sceneNumber).knotName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const knotProfile = getSceneKnotProfile(scene.sceneNumber);
                UnifiedAudioAuditionEngine.getInstance().playMasterAudio(knotProfile.rateMultiplier, () => {});
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Phát trực tiếp giọng đọc MP3 đã nạp vào lời bình này"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Đọc Giọng MP3 Gốc (Đã Nạp)</span>
            </button>
          </div>
        )}

        {/* Script Content / Inline Editor */}
        {!isEditingInline ? (
          <div className="p-4 rounded-lg bg-stone-950/70 border border-stone-800/80 text-stone-200 text-sm leading-relaxed font-serif italic border-l-2 border-l-amber-500 whitespace-pre-line">
            "{scene.narration}"
          </div>
        ) : (
          <div className="space-y-1.5">
            <textarea
              rows={6}
              value={inlineText}
              onChange={(e) => setInlineText(e.target.value)}
              className="w-full p-3.5 rounded-lg bg-stone-950 border border-amber-600/70 focus:border-amber-400 text-stone-100 text-sm font-serif leading-relaxed outline-none transition-all resize-y"
              placeholder="Nhập nội dung lời bình giọng đọc..."
            />
            <div className="flex justify-between items-center text-[10px] text-stone-400 px-1 font-mono">
              <span>Đang đếm trực tiếp: {inlineText.length} ký tự (tính cả chữ cái, số, dấu câu, khoảng trắng)</span>
              <span className={style.text}>Độ ăn khớp: {pacing.matchPercentage}% thời lượng</span>
            </div>
          </div>
        )}

        {/* AUDIO PRODUCER: VOICE AUDITION STUDIO (100% UNIFIED MASTER NARRATOR FOR ALL 4 ACTS) */}
        {showAuditionStudio && (
          <VoiceAuditionPlayer
            text={isEditingInline ? inlineText : scene.narration}
            sceneNumber={scene.sceneNumber}
            actNumber={actIndex}
            sceneTitle={scene.title}
            characterName={characterName}
          />
        )}

        {/* SEAMLESS FLOW TRANSITION NOTE */}
        {scene.transitionNote && (
          <div className="p-3 rounded-lg bg-stone-950/90 border border-amber-900/40 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Ghi Chú Nối Mạch (Seamless Flow Sang Scene #{scene.sceneNumber + 1}):</span>
            </div>
            <p className="text-stone-300 font-serif italic text-xs leading-relaxed pl-3.5 border-l-2 border-amber-600/60">
              {scene.transitionNote}
            </p>
          </div>
        )}
      </div>

      {/* HISTORICAL VISUAL ARCHIVE / RECONSTRUCTION DESCRIPTION */}
      {scene.visualDescription && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800/80 text-xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mô Tả Hình Ảnh Tư Liệu / Phục Dựng:</span>
          </span>
          <p className="text-stone-300 font-serif italic leading-relaxed pl-5">
            {scene.visualDescription}
          </p>
        </div>
      )}

      {/* COLLAPSIBLE 3 STORY BEATS SECTION */}
      {showStoryBeats && (
        <div className="rounded-xl bg-stone-950/95 border border-amber-800/60 p-4 space-y-3.5 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <h5 className="font-serif text-sm font-bold text-amber-300">
                Đạo Diễn Visual: 3 Nút Thắt (Story Beats) Phân Cảnh #{scene.sceneNumber}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateBeats}
                disabled={isGeneratingBeats}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isGeneratingBeats ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>{isGeneratingBeats ? 'Đang tạo...' : 'Tạo Lại Bằng AI'}</span>
              </button>
              <button
                onClick={() => setShowStoryBeats(false)}
                className="text-stone-400 hover:text-stone-200 text-xs p-1"
                title="Thu gọn"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {scene.storyBeats && scene.storyBeats.length > 0 ? (
            <div className="space-y-3">
              {scene.storyBeats.map((beat) => (
                <div key={beat.id || beat.beatNumber} className="p-3.5 rounded-lg bg-stone-900/80 border border-stone-800/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {beat.title}
                    </span>
                    <button
                      onClick={() => {
                        const formatted = `${beat.title}\n🎙️ Lời bình: "${beat.voiceoverExcerpt}"\n📸 Image Prompt: ${beat.imagePrompt}\n🎥 Video Motion Prompt: ${beat.videoMotionPrompt}\n(Ghi chú đạo diễn: ${beat.directorNote})`;
                        copyToClipboard(formatted, 'nar');
                      }}
                      className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép nút thắt</span>
                    </button>
                  </div>

                  <div className="text-xs font-serif italic text-stone-200 bg-stone-950/70 p-2.5 rounded border border-stone-800/80">
                    🎙️ "{beat.voiceoverExcerpt}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-stone-950 border border-stone-800/80 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-semibold block uppercase">📸 Image Prompt (EN):</span>
                      <p className="text-stone-300 text-[11px] select-all leading-relaxed">{beat.imagePrompt}</p>
                    </div>
                    <div className="p-2.5 rounded bg-stone-950 border border-stone-800/80 space-y-1">
                      <span className="text-[10px] text-cyan-400 font-semibold block uppercase">🎥 Video Motion Prompt (EN):</span>
                      <p className="text-stone-300 text-[11px] select-all leading-relaxed">{beat.videoMotionPrompt}</p>
                    </div>
                  </div>

                  {beat.directorNote && (
                    <div className="text-[11px] text-stone-300 italic bg-stone-950/40 p-2 rounded border border-amber-900/30">
                      🎬 <strong className="text-amber-400 font-medium">Ghi chú đạo diễn:</strong> {beat.directorNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-lg bg-stone-900/60 border border-dashed border-stone-800 text-center space-y-2">
              <p className="text-xs text-stone-400">
                Chưa có 3 nút thắt Story Beats cho phân cảnh này. Bấm vào nút bên dưới để Đạo diễn AI tự động bóc tách.
              </p>
              <button
                onClick={handleGenerateBeats}
                disabled={isGeneratingBeats}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold inline-flex items-center gap-1.5 shadow"
              >
                {isGeneratingBeats ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Bóc Tách 3 Nút Thắt Bằng AI</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        {/* Midjourney / Flux Image Prompt */}
        <div className="rounded-lg bg-stone-950/90 border border-stone-800/90 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Image Prompt (Midjourney / Flux):
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/60 text-emerald-300 font-bold">
                --ar 16:9
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(scene.imagePrompt, 'img')}
                className="text-stone-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                title="Sao chép câu lệnh hình ảnh chuẩn sắc nét 16:9"
              >
                {copiedImage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedImage ? 'Đã chép' : 'Chép Prompt'}</span>
              </button>

              <button
                onClick={() => {
                  let prompt = scene.imagePrompt;
                  if (!prompt.includes('--v 6.1')) {
                    prompt = `${prompt.replace(/--ar\s+16:9/g, '').trim()} --v 6.1 --style raw --ar 16:9`;
                  }
                  navigator.clipboard.writeText(prompt);
                  showToast('Đã sao chép Prompt có kèm tham số Midjourney v6.1 raw');
                }}
                className="text-stone-400 hover:text-amber-300 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-900 border border-amber-900/50 hover:bg-stone-800 transition-colors"
                title="Sao chép câu lệnh kèm tham số --v 6.1 --style raw --ar 16:9"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>+ MJ v6.1</span>
              </button>
            </div>
          </div>
          <p className="text-xs font-mono text-stone-300 select-all leading-normal break-words bg-stone-900/50 p-2.5 rounded border border-stone-800">
            {scene.imagePrompt}
          </p>
        </div>

        {/* Video Prompt (Runway / Kling / Veo) */}
        <div className="rounded-lg bg-stone-950/90 border border-stone-800/90 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              Video Motion Prompt (Kling / Runway / Veo):
            </span>
            <button
              onClick={() => copyToClipboard(scene.videoPrompt, 'vid')}
              className="text-stone-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
            >
              {copiedVideo ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedVideo ? 'Đã chép' : 'Chép Prompt'}</span>
            </button>
          </div>
          <p className="text-xs font-mono text-stone-300 select-all leading-normal break-words bg-stone-900/50 p-2 rounded border border-stone-800">
            {scene.videoPrompt}
          </p>
        </div>
      </div>

      {/* Audio & Sound Design Cue */}
      {scene.audioDesign && (
        <div className="flex items-start gap-2 text-xs text-stone-400 bg-stone-950/40 px-3 py-2 rounded-md border border-stone-800/60">
          <span className="text-amber-500 font-semibold shrink-0">🎵 Âm thanh & SFX:</span>
          <span>{scene.audioDesign}</span>
        </div>
      )}
    </div>
  );
};
