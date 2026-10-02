import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Clock,
  ShieldAlert,
  Compass,
  Flame,
  Info,
  CheckCircle2,
  Gauge,
  Copy,
  Check,
  RefreshCw,
  FileText,
  LayoutList,
  Layers,
  Music,
  BookOpen,
  ArrowRight,
  User,
  Mic,
  Quote,
} from 'lucide-react';
import { GenerationParams, MasterScriptProject, DirectorSixPartAnalysis } from '../types/script';

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProject: MasterScriptProject) => void;
  onOpenImportModal?: () => void;
}

const HISTORICAL_SUGGESTIONS = [
  { name: 'Võ Tắc Thiên', era: 'Đường Triều', hint: 'Nữ hoàng duy nhất, tấm bia vô tự' },
  { name: 'Tào Tháo', era: 'Tam Quốc', hint: 'Khúc tráng ca gian hùng, thà phụ thiên hạ' },
  { name: 'Trần Hưng Đạo', era: 'Nhà Trần (Đại Việt)', hint: 'Ba lần đại thắng Nguyên Mông' },
  { name: 'Hàn Tín', era: 'Hán Sở Tranh Hùng', hint: 'Binh thánh luồn trĩu háng & chết bi thảm' },
  { name: 'Lý Thường Kiệt', era: 'Nhà Lý (Đại Việt)', hint: 'Nam quốc sơn hà & phòng tuyến Như Nguyệt' },
  { name: 'Julius Caesar', era: 'La Mã Cổ Đại', hint: 'Veni Vidi Vici & nhát dao Ides of March' },
  { name: 'Gia Cát Lượng', era: 'Tam Quốc', hint: 'Cúc cung tận tụy, chết vì đại nghiệp' },
  { name: 'Hồ Quý Ly', era: 'Đầu thế kỷ 15', hint: 'Cải cách tiền giấy & mất nước bi thương' },
];

export const CreateScriptModal: React.FC<CreateScriptModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [params, setParams] = useState<GenerationParams>({
    characterName: '',
    eraOrContext: '',
    targetDurationMinutes: 34, // Default to master 4-act maximum duration: 5p + 12p + 10p + 7p = 34p
    heroicTragicRatio: 60,
    toneStyle: 'epic-tragic',
    customFocalAngle: '',
    speechRateMode: 'standard',
  });

  const [directorAnalysis, setDirectorAnalysis] = useState<DirectorSixPartAnalysis | null>(null);
  const [isAnalyzingCharacter, setIsAnalyzingCharacter] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisViewTab, setAnalysisViewTab] = useState<'cards' | 'templates' | 'raw_text'>('cards');
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  // Function to analyze character via 6-part director structure
  const runSixPartAnalysis = async (characterName: string, era?: string, duration: number = 34) => {
    if (!characterName.trim() || characterName.trim().length < 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAnalyzingCharacter(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-character-six-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          characterName: characterName.trim(),
          eraOrContext: era || '',
          targetDurationMinutes: duration || 34,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Không thể phân tích nhân vật theo 6 phần.');
      }

      const data = await response.json();
      if (data.analysis) {
        const ana: DirectorSixPartAnalysis = data.analysis;
        setDirectorAnalysis(ana);

        // Automatically populate modal form fields from the 6 parts
        setParams((prev) => ({
          ...prev,
          eraOrContext: ana.historicalEraAndContext || prev.eraOrContext,
          targetDurationMinutes: ana.durationBreakdown?.totalMinutes || prev.targetDurationMinutes,
          speechRateMode: ana.voiceoverPacingTech?.speedMode || prev.speechRateMode,
          toneStyle: ana.directorStyleAndTone?.styleKey || prev.toneStyle,
          heroicTragicRatio: ana.actEmotionMusicRatio?.heroicPercent ?? prev.heroicTragicRatio,
          customFocalAngle: (ana.specialPerspectives || []).join('; ') || prev.customFocalAngle,
          directorSixPartAnalysis: ana,
        }));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setAnalysisError(err.message || 'Lỗi khi phân tích nhân vật.');
    } finally {
      setIsAnalyzingCharacter(false);
    }
  };

  const handleSelectSuggestion = (sug: { name: string; era: string; hint: string }) => {
    setParams((prev) => ({
      ...prev,
      characterName: sug.name,
      eraOrContext: sug.era,
      customFocalAngle: sug.hint,
    }));
    // Trigger immediate 6-part analysis for the suggested character
    runSixPartAnalysis(sug.name, sug.era, params.targetDurationMinutes);
  };

  const handleCharacterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setParams((prev) => ({ ...prev, characterName: val }));

    // Debounce auto-analysis: when user pauses typing for 1000ms and has >= 3 chars
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (val.trim().length >= 3) {
      typingTimeoutRef.current = setTimeout(() => {
        runSixPartAnalysis(val, params.eraOrContext, params.targetDurationMinutes);
      }, 1000);
    }
  };

  const handleCopyAnalysisText = () => {
    if (!directorAnalysis?.fullFormattedText) return;
    navigator.clipboard.writeText(directorAnalysis.fullFormattedText);
    setCopiedAnalysis(true);
    setTimeout(() => setCopiedAnalysis(false), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.characterName.trim()) {
      setErrorMessage('Vui lòng nhập tên nhân vật lịch sử.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Dynamic animated step indicators while generating 6-part Master Script
    const steps = [
      'Đang phân tích hình mẫu nhân vật & Áp dụng Cấu trúc 6 Phần Chính Điện Ảnh...',
      'Đang xây dựng Phần 1: The Hook (Lời tựa gây chấn động) & Phần 2: Vết thương quá khứ...',
      'Đang khởi tạo Phần 3: Ý tưởng điên rồ & Canh bạc đánh đổi chí mạng...',
      'Đang khai phá Phần 4: Đỉnh cao quyền lực & Phần 5: Điểm mù tai họa ngấm ngầm...',
      'Đang đúc kết Phần 6: Sự sụp đổ bi tráng & Bài học nhân sinh ngàn đời...',
      'Đang cân chỉnh ký tự ăn khớp 100% với thời lượng dài nhất cho cả 12 phân cảnh...',
      'Đang tối ưu Prompts hình ảnh sắc nét Midjourney/Flux 8k & Video Motion chuẩn điện ảnh...',
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 3200);

    try {
      const payload: GenerationParams = {
        ...params,
        directorSixPartAnalysis: directorAnalysis || undefined,
      };

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Lỗi khi gọi API tạo kịch bản.');
      }

      const data = await response.json();
      if (data.project) {
        onSuccess(data.project);
        onClose();
      } else {
        throw new Error('Dữ liệu trả về không đúng cấu trúc kịch bản.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMessage(err.message || 'Không thể tạo kịch bản từ Gemini. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const heroic = params.heroicTragicRatio;
  const tragic = 100 - params.heroicTragicRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-stone-900 border border-amber-800/80 rounded-2xl shadow-2xl text-stone-100 p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-stone-800 pb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-800 flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-950/60 shrink-0">
            <Wand2 className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Khởi Tạo Kịch Bản 6 Phần Chính Chuyên Nghiệp
            </h2>
            <p className="text-xs text-stone-400">
              Nhập tên nhân vật — Hệ thống sẽ <strong>tự động truy xuất CHÍNH SỬ, phân tích cấu trúc 6 Phần Chính (12 Phân Cảnh)</strong> và phân bổ chuẩn xác thời lượng từng Scene.
            </p>
          </div>
        </div>

        {/* Suggestion Pills */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gợi Ý Nhân Vật Lịch Sử Đắt Giá (Click để tự động phân tích):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HISTORICAL_SUGGESTIONS.map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="px-2.5 py-1 text-xs rounded-md bg-stone-800 hover:bg-amber-950/70 hover:text-amber-300 border border-stone-700/60 hover:border-amber-700/60 text-stone-300 transition-all font-medium cursor-pointer"
              >
                {sug.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Character Name Input Bar with Direct Action */}
          <div>
            <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>
                Tên Nhân Vật Lịch Sử <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Nhập xong hệ thống tự động phân tích 6 phần
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={params.characterName}
                onChange={handleCharacterNameChange}
                onBlur={() => {
                  if (params.characterName.trim().length >= 2 && !directorAnalysis && !isAnalyzingCharacter) {
                    runSixPartAnalysis(params.characterName, params.eraOrContext, params.targetDurationMinutes);
                  }
                }}
                placeholder="VD: Võ Tắc Thiên, Tào Tháo, Quang Trung, Hàn Tín, Trần Hưng Đạo, Julius Caesar..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-stone-100 text-sm outline-none placeholder:text-stone-600 transition-all font-serif"
              />
              <button
                type="button"
                onClick={() => runSixPartAnalysis(params.characterName, params.eraOrContext, params.targetDurationMinutes)}
                disabled={!params.characterName.trim() || isAnalyzingCharacter}
                className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-amber-900/60 border border-stone-700 hover:border-amber-600/80 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                title="Phân tích chi tiết nhân vật theo 6 phần đạo diễn"
              >
                {isAnalyzingCharacter ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden sm:inline">
                  {isAnalyzingCharacter ? 'Đang phân tích...' : 'Phân Tích 6 Phần (AI)'}
                </span>
                <span className="sm:hidden">Phân Tích</span>
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-amber-300/80">
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 font-mono">
                ⚡ 100% Chính Sử
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 font-mono text-stone-300">
                🎭 10 Quy tắc Xưng hô Đa tầng (Quân-thần, Rạn nứt, Không gian quyền lực)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 font-mono text-stone-300">
                👥 Nhân vật phụ xúc tác 12 Scenes
              </span>
            </div>
          </div>

          {/* ACTIVE ANALYZING BANNER */}
          {isAnalyzingCharacter && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span>Đang phân tích nhân vật theo Cấu Trúc 6 Phần Đạo Diễn & Biên Kịch...</span>
              </div>
              <p className="text-[11px] text-stone-300 font-serif italic pl-6">
                Hệ thống đang tóm lược bối cảnh thời đại, phân bổ sự kiện 4 Hồi, tính toán kỹ thuật giọng đọc, phong cách đạo diễn, tỷ lệ cảm xúc và góc nhìn tâm lý học phá cách...
              </p>
            </div>
          )}

          {/* ANALYSIS ERROR */}
          {analysisError && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* 6-PART DIRECTOR ANALYSIS BOARD */}
          {directorAnalysis && !isAnalyzingCharacter && (
            <div className="rounded-xl bg-gradient-to-b from-stone-950 to-stone-900/90 border border-amber-600/50 p-4 sm:p-5 space-y-4 shadow-xl">
              {/* Header with Switch & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-serif text-sm sm:text-base font-bold text-amber-300">
                    Bản Phân Tích Đạo Diễn & Biên Kịch (Cấu Trúc 6 Phần Chuẩn Điện Ảnh)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tab switch */}
                  <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAnalysisViewTab('cards')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        analysisViewTab === 'cards'
                          ? 'bg-amber-600 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <LayoutList className="w-3 h-3 inline mr-1" />
                      Thẻ Trực Quan
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalysisViewTab('templates')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        analysisViewTab === 'templates'
                          ? 'bg-amber-600 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Mic className="w-3 h-3 inline mr-1" />
                      Cấu Trúc Mẫu (VO & Thoại)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalysisViewTab('raw_text')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        analysisViewTab === 'raw_text'
                          ? 'bg-amber-600 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <FileText className="w-3 h-3 inline mr-1" />
                      Format Chuẩn 1/ - 6/
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyAnalysisText}
                    className="px-2.5 py-1 rounded-md bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                    title="Sao chép toàn bộ bản phân tích 6 phần"
                  >
                    {copiedAnalysis ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedAnalysis ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* View 1: Rich Visual Cards for 6 parts */}
              {analysisViewTab === 'cards' && (
                <div className="space-y-3.5 text-xs">
                  {/* Part 1 */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>1/ Thời Đại / Bối Cảnh Lịch Sử:</span>
                    </div>
                    <p className="text-stone-200 leading-relaxed font-serif pl-1">
                      {directorAnalysis.historicalEraAndContext}
                    </p>
                  </div>

                  {/* Part 2: 4 Acts Breakdown */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-2">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>2/ Thời Lượng Phân Bổ: [{directorAnalysis.durationBreakdown.totalDuration}]</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">Chia nhỏ thành 6 Phần (12 Phân Cảnh)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-sans">
                      <div className="p-2.5 rounded bg-stone-900/80 border border-stone-800">
                        <strong className="text-amber-300 font-bold block mb-1">
                          Phần 1 & 2 (Khởi nguồn & Vết thương):
                        </strong>
                        <p className="text-[11px] text-stone-300 leading-snug">
                          {directorAnalysis.durationBreakdown.act1NameAndSummary}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-stone-900/80 border border-stone-800">
                        <strong className="text-orange-300 font-bold block mb-1">
                          Phần 3 (Ý tưởng điên rồ & Bứt phá):
                        </strong>
                        <p className="text-[11px] text-stone-300 leading-snug">
                          {directorAnalysis.durationBreakdown.act2NameAndSummary}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-stone-900/80 border border-stone-800">
                        <strong className="text-yellow-300 font-bold block mb-1">
                          Phần 4 & 5 (Đỉnh cao & Điểm mù):
                        </strong>
                        <p className="text-[11px] text-stone-300 leading-snug">
                          {directorAnalysis.durationBreakdown.act3NameAndSummary}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-stone-900/80 border border-stone-800">
                        <strong className="text-rose-300 font-bold block mb-1">
                          Phần 6 (Sụp đổ & Bài học nhân sinh):
                        </strong>
                        <p className="text-[11px] text-stone-300 leading-snug">
                          {directorAnalysis.durationBreakdown.act4NameAndSummary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 3 */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3/ Tốc độ phát thanh viên (Giọng đọc):</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 font-mono text-[10px]">
                        {directorAnalysis.voiceoverPacingTech.cps || 13} ký tự/giây
                      </span>
                    </div>
                    <p className="text-stone-200 leading-relaxed pl-1">
                      {directorAnalysis.voiceoverPacingTech.analysis}
                    </p>
                  </div>

                  {/* Part 4 */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>4/ Phong Cách & Tông Giọng Đạo Diễn:</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-600/50 text-amber-300 font-mono text-[10px]">
                        {directorAnalysis.directorStyleAndTone.styleName || 'Hào hùng bi tráng'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {(directorAnalysis.directorStyleAndTone.keywords || []).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 text-[10px] font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-stone-200 leading-relaxed pl-1">
                      {directorAnalysis.directorStyleAndTone.applicationGuide}
                    </p>
                  </div>

                  {/* Part 5 */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-2">
                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        <span>5/ Tỉ Lệ Cảm Xúc 4 Hồi & Định Hướng Âm Nhạc:</span>
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {directorAnalysis.actEmotionMusicRatio.heroicPercent}% Hào Hùng /{' '}
                        {directorAnalysis.actEmotionMusicRatio.tragicPercent}% Bi Kịch
                      </span>
                    </div>
                    <p className="text-stone-200 leading-relaxed pl-1">
                      {directorAnalysis.actEmotionMusicRatio.actAtmosphereAndMusic}
                    </p>
                  </div>

                  {/* Part 6 */}
                  <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800/90 space-y-1.5">
                    <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>6/ Góc Nhìn Khai Thác Đặc Biệt (Tâm Lý & Phá Cách):</span>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {(directorAnalysis.specialPerspectives || []).map((persp, idx) => (
                        <li key={idx} className="text-stone-200 leading-relaxed flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>{persp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* View 2: Formatted raw text block */}
              {analysisViewTab === 'raw_text' && (
                <div className="space-y-2">
                  <div className="text-[10px] text-stone-400 font-mono">
                    Format phân tích tiêu chuẩn dành cho kịch bản tài liệu lịch sử:
                  </div>
                  <pre className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all max-h-[360px] overflow-y-auto">
                    {directorAnalysis.fullFormattedText}
                  </pre>
                </div>
              )}

              {/* View 3: Cấu Trúc Mẫu Biên Kịch (Voiceover & Dialogue) for 6 Parts */}
              {analysisViewTab === 'templates' && (
                <div className="space-y-3.5 text-xs max-h-[420px] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-amber-300 font-bold text-xs uppercase tracking-wide">
                        Quy Tắc Biên Kịch Cốt Lõi: Hội Thoại Nhúng VO & Cliffhanger Liền Mạch
                      </h4>
                      <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                        Toàn bộ 6 cấu trúc mẫu này được thiết kế theo <strong>100% Chính Sử</strong> với quy tắc: <em>VO dẫn ➔ Nhân vật nói thoại ➔ VO bắt lấy câu thoại phân tích tiếp ➔ Cliffhanger ném mồi lửa sang phần sau</em>. Khi bạn khởi tạo, hệ thống sẽ tự động phân bổ đề xuất thẳng vào <strong>Lời Bình Giọng Đọc (Voiceover Script)</strong> của các Scene tương ứng!
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const tpl = directorAnalysis.sixPartTemplates;
                    const partsList = [
                      {
                        index: 1,
                        title: 'Phần 1: The Hook (Lời Tựa Gây Chấn Động)',
                        badge: '3:00 • 10-15%',
                        data: tpl?.part1Hook,
                        defaultTone: 'Trầm hùng, chấn động, khơi gợi tò mò tột độ',
                      },
                      {
                        index: 2,
                        title: 'Phần 2: Vết Thương Quá Khứ & Nỗi Đau Cội Nguồn',
                        badge: '5:30 • 15-20%',
                        data: tpl?.part2PastWound,
                        defaultTone: 'Bi tráng, sâu lắng, nghẹn ngào',
                      },
                      {
                        index: 3,
                        title: 'Phần 3: Ý Tưởng Điên Rồ & Canh Bạc Đánh Đổi Chí Mạng',
                        badge: '8:30 • 20-25%',
                        data: tpl?.part3CrazyIdea,
                        defaultTone: 'Mạnh mẽ, quả quyết, căng như dây đàn',
                      },
                      {
                        index: 4,
                        title: 'Phần 4: Đỉnh Cao Quyền Lực & Khúc Ca Khải Hoàn',
                        badge: '6:45 • 15%',
                        data: tpl?.part4PowerPeak,
                        defaultTone: 'Hùng tráng, uy nghiêm, vang dội non sông',
                      },
                      {
                        index: 5,
                        title: 'Phần 5: Điểm Mù Tai Họa & Kẽ Nứt Định Mệnh',
                        badge: '5:30 • 15%',
                        data: tpl?.part5BlindSpot,
                        defaultTone: 'Lạnh lẽo, căng thẳng, báo trước giông bão',
                      },
                      {
                        index: 6,
                        title: 'Phần 6: Sự Sụp Đổ Bi Tráng & Bài Học Nhân Sinh Ngàn Đời',
                        badge: '4:45 • 10-15%',
                        data: tpl?.part6TheFall,
                        defaultTone: 'Chiêm nghiệm, lắng đọng, ngân dài dư ba thiên thu',
                      },
                    ];

                    return partsList.map((item) => (
                      <div key={item.index} className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                          <span className="font-bold text-amber-300 font-serif flex items-center gap-1.5">
                            <Quote className="w-3.5 h-3.5 text-amber-400" />
                            <span>{item.title}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                            {item.badge}
                          </span>
                        </div>

                        <div className="space-y-2 pt-0.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">[VO KỂ CHUYỆN / VO DẪN]</span>
                            <p className="text-stone-300 font-serif italic bg-stone-900/60 p-2 rounded border border-stone-800/60 mt-0.5 leading-relaxed">
                              "{item.data?.voIntro || 'Lời dẫn mở đầu sắc bén...'}"
                            </p>
                            <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                              Tông giọng: {item.data?.voTone || item.defaultTone}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">[HỘI THOẠI TRỰC TIẾP NHÚNG VÀO DÒNG CHẢY VO]</span>
                            <p className="text-stone-200 font-serif italic bg-stone-900/60 p-2 rounded border border-stone-800/60 mt-0.5 leading-relaxed">
                              {item.data?.dialogue || 'Lời đối thoại chính sử hoặc tâm thức hào hùng...'}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">[VO PHÂN TÍCH TIẾP & CLIFFHANGER NÉM MỒI LỬA]</span>
                            <p className="text-stone-300 font-serif italic bg-stone-900/60 p-2 rounded border border-stone-800/60 mt-0.5 leading-relaxed">
                              "{item.data?.voOutro || 'Lời bình kết nối nguyên nhân - kết quả...'}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* Sync confirmation banner */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/50 text-[11px] text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Đã tự động đồng bộ:</strong> Toàn bộ 6 cấu trúc phân tích trên đã được đưa vào các trường thiết lập bên dưới. Khi nhấn <em>"Kiến Tạo Kịch Bản 6 Phần Chính Hoàn Chỉnh"</em>, AI sẽ áp dụng triệt để vào 6 Phần (12 Phân Cảnh).
                </span>
              </div>
            </div>
          )}

          {/* Form Detailed Fields (Pre-filled and Fine-tunable) */}
          <div className="space-y-4 pt-1">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Thiết Lập Chi Tiết Áp Dụng Cho 6 Phần Chính (12 Phân Cảnh):</span>
            </div>

            {/* Era / Context */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                1/ Thời Đại / Bối Cảnh Lịch Sử (Đã tự động điền từ phân tích)
              </label>
              <input
                type="text"
                value={params.eraOrContext}
                onChange={(e) => setParams({ ...params, eraOrContext: e.target.value })}
                placeholder="VD: Cuối thời Lê Sơ, Thời Chiến Quốc, Thế kỷ 18, Tam Quốc..."
                className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm outline-none placeholder:text-stone-600 transition-all font-sans"
              />
            </div>

            {/* Duration & Speech Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    2/ Thời Lượng Phân Bổ
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Dài nhất 34p</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { m: 34, l: '34p (Chuẩn Max)' },
                    { m: 30, l: '30p' },
                    { m: 25, l: '25p' },
                    { m: 20, l: '20p' },
                  ].map((item) => (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setParams({ ...params, targetDurationMinutes: item.m })}
                      className={`py-2 text-[11px] font-medium rounded-md border text-center transition-all ${
                        params.targetDurationMinutes === item.m
                          ? 'bg-amber-600 border-amber-400 text-stone-950 font-bold shadow-md'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {item.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  3/ Tốc Độ Phát Thanh Viên (Giọng Đọc)
                </label>
                <select
                  value={params.speechRateMode}
                  onChange={(e) => setParams({ ...params, speechRateMode: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-200 text-xs outline-none"
                >
                  <option value="standard">Chuẩn tài liệu: 13 ký tự/giây (Khuyên dùng)</option>
                  <option value="slow">Thong thả / Bi tráng: 11 ký tự/giây</option>
                  <option value="fast">Dồn dập / Chiến trận: 15 ký tự/giây</option>
                </select>
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                4/ Phong Cách & Tông Giọng Đạo Diễn
              </label>
              <select
                value={params.toneStyle}
                onChange={(e) => setParams({ ...params, toneStyle: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-200 text-xs outline-none"
              >
                <option value="epic-tragic">Hào hùng bi tráng (Heroic & Tragic) — Giàu chất sử thi</option>
                <option value="dark-strategy">Thâm trầm mưu lược (Strategic Intrigue) — Quyền mưu thâm sâu</option>
                <option value="philosophical-karmic">Triết lý nhân quả (Philosophical Karmic) — Đúc kết thế sự</option>
                <option value="raw-documentary">Chân thực tài liệu (Raw Documentary) — Khách quan, sắc lạnh</option>
              </select>
            </div>

            {/* Heroic vs Tragic Ratio Slider */}
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  5/ Tỉ Lệ Cảm Xúc 6 Phần (Hào Hùng vs Bi Kịch)
                </span>
                <div className="text-xs font-mono font-bold">
                  <span className="text-amber-400">{heroic}% Hào Hùng</span>
                  <span className="text-stone-500 mx-1.5">/</span>
                  <span className="text-rose-400">{tragic}% Bi Kịch</span>
                </div>
              </div>

              {/* Visual Dual Gradient Bar */}
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-stone-800 mb-3">
                <div
                  style={{ width: `${heroic}%` }}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                />
                <div
                  style={{ width: `${tragic}%` }}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-300"
                />
              </div>

              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={params.heroicTragicRatio}
                onChange={(e) => setParams({ ...params, heroicTragicRatio: Number(e.target.value) })}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Focal Angle */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                6/ Góc Nhìn Khai Thác Đặc Biệt (Tâm lý học hoặc phá cách)
              </label>
              <textarea
                rows={2}
                value={params.customFocalAngle}
                onChange={(e) => setParams({ ...params, customFocalAngle: e.target.value })}
                placeholder="VD: Tập trung vào bi kịch quyền lực, mâu thuẫn giữa lý tưởng và lòng người..."
                className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm outline-none placeholder:text-stone-600 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Highlight feature banner */}
          <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200/90 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Tính năng áp dụng triệt để 6 cấu trúc:</strong>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-normal">
                Khi nhấn nút kiến tạo bên dưới, toàn bộ 6 cấu trúc phân tích chi tiết của nhân vật (Bối cảnh, 6 Phần chính, Giọng đọc, Phong cách đạo diễn, Không gian cảm xúc & Góc nhìn đặc biệt) sẽ được truyền trực tiếp vào bộ máy kịch bản và phân bổ chính xác 100% thời lượng dài nhất từng Scene.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button & Loading State */}
          <div className="pt-2">
            {!isLoading ? (
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-stone-950" />
                <span>Kiến Tạo Kịch Bản 6 Phần Chính Hoàn Chỉnh</span>
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl bg-stone-950 border border-amber-600/60 space-y-2 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
                  <Wand2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI Đang Truy Xuất Chính Sử & Viết Kịch Bản 6 Phần Chính (12 Phân Cảnh)...</span>
                </div>
                <p className="text-xs text-stone-300 font-serif italic">
                  {loadingStep}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
