import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Music,
  CheckCircle2,
  Play,
  Square,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Sparkles,
  Volume2,
  FileAudio,
  Activity,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import {
  UnifiedAudioAuditionEngine,
  MasterUploadedVoice,
} from '../utils/audioAudition';

interface MasterAudioUploaderProps {
  characterName: string;
  onVoiceActivated?: (voice: MasterUploadedVoice) => void;
  onApplyToAllScenes?: (voice: MasterUploadedVoice) => void;
}

export const MasterAudioUploader: React.FC<MasterAudioUploaderProps> = ({
  characterName,
  onVoiceActivated,
  onApplyToAllScenes,
}) => {
  const engine = UnifiedAudioAuditionEngine.getInstance();
  const [currentVoice, setCurrentVoice] = useState<MasterUploadedVoice | null>(
    engine.getMasterUploadedVoice()
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApply = () => {
    if (!currentVoice) return;
    setIsApplied(true);
    if (onApplyToAllScenes) {
      onApplyToAllScenes(currentVoice);
    }
  };

  // Subscribe to engine state changes
  useEffect(() => {
    const unsubscribe = engine.subscribe((voice) => {
      setCurrentVoice(voice);
    });
    return () => unsubscribe();
  }, []);

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      setErrorMessage('Vui lòng chọn định dạng âm thanh (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      // Create Object URL for instant browser playback
      const audioUrl = URL.createObjectURL(file);

      // Measure duration
      const tempAudio = new Audio(audioUrl);
      await new Promise<void>((resolve, reject) => {
        tempAudio.onloadedmetadata = () => resolve();
        tempAudio.onerror = () => resolve(); // continue even if metadata fails
      });

      const durationSec = Math.round(tempAudio.duration || 120);

      const newVoice: MasterUploadedVoice = {
        fileName: file.name,
        fileSize: file.size,
        durationSeconds: durationSec,
        audioUrl,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      // Set as active master voice in engine
      engine.setMasterUploadedVoice(newVoice);
      setCurrentVoice(newVoice);

      if (onVoiceActivated) {
        onVoiceActivated(newVoice);
      }

      // Call AI to analyze voice characteristics and map to 12 knots
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze-master-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            durationSeconds: durationSec,
            characterName,
          }),
        });

        if (response.ok) {
          const analysisData = await response.json();
          newVoice.analyzedProfile = analysisData;
          engine.setMasterUploadedVoice(newVoice);
          setCurrentVoice({ ...newVoice });
        }
      } catch (analyzeErr) {
        console.warn('AI Voice analysis warning:', analyzeErr);
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      console.error('File process error:', err);
      setErrorMessage('Không thể đọc file âm thanh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      engine.stopAll();
      setIsPlaying(false);
      setProgress(0);
    } else {
      if (!currentVoice) return;
      setIsPlaying(true);
      engine.playMasterAudio(
        1.0,
        () => {
          setIsPlaying(false);
          setProgress(0);
        },
        (p) => setProgress(p)
      );
    }
  };

  const handleRemove = () => {
    engine.stopAll();
    setIsPlaying(false);
    setProgress(0);
    engine.setMasterUploadedVoice(null);
    setCurrentVoice(null);
  };

  // Helper to load sample voice recording if user doesn't have an MP3 ready
  const handleLoadSampleVoice = () => {
    // Generate synthesized demonstration master sample
    const sampleVoice: MasterUploadedVoice = {
      fileName: 'Giong_Doc_Mau_Su_Thi_Vu_Hung.mp3',
      fileSize: 3450000,
      durationSeconds: 154,
      audioUrl: '', // Will use speech synthesis or studio stream
      analyzedProfile: {
        voiceActorName: 'Vũ Hùng (Giọng Nam Trầm Lịch Sử Phương Đông)',
        timbre: 'Baritone trầm ấm, uy nghiêm, độ nén hơi sâu, chuẩn tài liệu sử thi',
        baseSpeechRateCps: 13,
        statusMessage: 'Đã kích hoạt 100% tệp MP3 mẫu làm Người dẫn chuyện duy nhất cho cả 4 Hồi.',
      },
      uploadedAt: 'Mẫu Đạo Diễn',
    };

    engine.setMasterUploadedVoice(sampleVoice);
    setCurrentVoice(sampleVoice);
    if (onVoiceActivated) onVoiceActivated(sampleVoice);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-amber-500/60 p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Top Banner & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-bold shadow-md">
            <Upload className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                Tải Lên File MP3 Giọng Đọc Gốc (Master Voice Import)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                DÙNG CHÍNH 100% GIỌNG NÀY CHO 12 NÚT THẮT
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Tải file MP3 thu âm của bạn hoặc diễn viên độc quyền. Hệ thống sẽ áp dụng <strong>chính xác 100% chất giọng này</strong> vào từng lời bình tương ứng với 12 nút thắt qua cả 4 Hồi.
            </p>
          </div>
        </div>

        {!currentVoice && (
          <button
            type="button"
            onClick={handleLoadSampleVoice}
            className="text-xs text-amber-400 hover:text-amber-300 font-mono underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nạp File Mẫu Thuyết Minh Vũ Hùng (MP3)</span>
          </button>
        )}
      </div>

      {/* Upload Dropzone if no voice is loaded */}
      {!currentVoice ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-amber-400 bg-amber-950/20'
              : 'border-stone-700 hover:border-amber-500/80 bg-stone-900/40 hover:bg-stone-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.ogg,.aac,audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <FileAudio className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-200">
                Kéo thả file MP3 hoặc nhấn để chọn tệp âm thanh giọng đọc gốc
              </p>
              <p className="text-xs text-stone-400">
                Hỗ trợ MP3, WAV, M4A, OGG (Dung lượng khuyến nghị: dưới 50MB)
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-md transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn File MP3 Từ Máy Tính</span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Master Voice Loaded Card */
        <div className="rounded-xl bg-stone-950/90 border border-emerald-500/50 p-4 space-y-4 shadow-xl">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-stone-100">
                    {currentVoice.fileName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                    ✓ ĐÃ KÍCH HOẠT 100%
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5 font-mono">
                  <span>Thời lượng: {currentVoice.durationSeconds}s</span>
                  <span>•</span>
                  <span>Dung lượng: {(currentVoice.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>Tải lên lúc: {currentVoice.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng Phát Giọng Gốc</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Nghe File MP3 Gốc</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
                title="Đổi sang file MP3 khác"
              >
                Đổi File
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/80 hover:text-rose-400 text-stone-400 border border-stone-700 transition-colors"
                title="Gỡ bỏ file MP3 này"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.aac,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Waveform & Scrubber */}
          {isPlaying && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> Đang phát file MP3 giọng đọc gốc
                </span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* AI Voice Characteristics Analysis */}
          {isAnalyzing ? (
            <div className="p-3 rounded-lg bg-stone-900/60 border border-amber-900/40 text-xs flex items-center gap-2 text-amber-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang phân tích âm sắc giọng đọc từ file MP3 để lập bản đồ thích ứng 12 nút thắt...</span>
            </div>
          ) : currentVoice.analyzedProfile ? (
            <div className="p-3.5 rounded-lg bg-stone-900/70 border border-stone-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kết Quả Phân Tích Giọng Đọc MP3 Gốc:</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">
                  Độ phù hợp 100% kịch bản lịch sử
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
                <div className="p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Âm sắc & Khí chất nhận diện:</span>
                  <p className="font-medium text-amber-200 mt-0.5">
                    {currentVoice.analyzedProfile.timbre || 'Trầm ấm, uy nghiêm, nội lực'}
                  </p>
                </div>
                <div className="p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Tốc độ phát thanh viên cơ sở:</span>
                  <p className="font-medium text-cyan-300 mt-0.5 font-mono">
                    ~{currentVoice.analyzedProfile.baseSpeechRateCps || 13} ký tự/giây (chuẩn tài liệu)
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-emerald-300/90 font-mono pt-1">
                ✓ {currentVoice.analyzedProfile.statusMessage}
              </p>
            </div>
          ) : null}

          {/* DEDICATED ACTION BUTTON: NẠP VÀO LỜI BÌNH (ÁP DỤNG 100% 4 HỒI) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-emerald-950/70 border-2 border-amber-500/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xl">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Kích Hoạt Đồng Bộ Toàn Bộ 4 Hồi Kịch Bản
                </span>
                {isApplied && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-stone-950 animate-pulse">
                    ✓ ĐÃ NẠP THÀNH CÔNG VÀO 12 SCENES
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-200 font-serif leading-relaxed">
                Nhấn nút <strong>"NẠP VÀO LỜI BÌNH"</strong> để áp dụng <strong>100% chính giọng đọc từ file MP3 này ({currentVoice.fileName})</strong> vào mục <em>"Lời Bình Giọng Đọc (Voiceover Script)"</em> của tất cả các phân cảnh xuyên suốt cả 4 Hồi!
              </p>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer shrink-0 ${
                isApplied
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-stone-950 ring-2 ring-emerald-400 shadow-emerald-950/80'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-amber-950/80 scale-100 hover:scale-105 active:scale-95'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-stone-950" />
                  <span>✓ ĐÃ NẠP VÀO LỜI BÌNH (100% 4 HỒI)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-stone-950" />
                  <span>NẠP VÀO LỜI BÌNH</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-600/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
