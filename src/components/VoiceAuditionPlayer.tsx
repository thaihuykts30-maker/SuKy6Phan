import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Volume2,
  Sparkles,
  RefreshCw,
  Download,
  ShieldCheck,
  UserCheck,
  Activity,
  Mic,
  Gauge,
  Compass,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Music,
  Upload,
} from 'lucide-react';
import {
  MASTER_NARRATOR,
  getSceneKnotProfile,
  UnifiedAudioAuditionEngine,
  SceneKnotProfile,
  MasterUploadedVoice,
} from '../utils/audioAudition';

interface VoiceAuditionPlayerProps {
  text: string;
  sceneNumber: number;
  actNumber: number;
  sceneTitle: string;
  characterName: string;
  speechRateMode?: 'slow' | 'standard' | 'fast';
  toneStyle?: string;
  onPacingUpdate?: (newCps: number) => void;
}

export const VoiceAuditionPlayer: React.FC<VoiceAuditionPlayerProps> = ({
  text,
  sceneNumber,
  actNumber,
  sceneTitle,
  characterName,
  speechRateMode = 'standard',
  toneStyle = 'epic-tragic',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStudioTts, setIsLoadingStudioTts] = useState(false);
  const [studioAudioBase64, setStudioAudioBase64] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<'master_mp3' | 'studio' | 'web_synth'>('web_synth');
  const [progress, setProgress] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [producerReport, setProducerReport] = useState<any>(null);
  const [masterMp3Voice, setMasterMp3Voice] = useState<MasterUploadedVoice | null>(null);

  const engine = UnifiedAudioAuditionEngine.getInstance();
  const knot: SceneKnotProfile = getSceneKnotProfile(sceneNumber);

  const cps = speechRateMode === 'slow' ? 11 : speechRateMode === 'fast' ? 15 : 13;
  const estimatedSeconds = Math.round(text.length / cps);

  // Subscribe to engine master uploaded voice
  useEffect(() => {
    const unsub = engine.subscribe((voice) => {
      setMasterMp3Voice(voice);
      if (voice) {
        setAudioSource('master_mp3');
      }
    });

    return () => {
      unsub();
      engine.stopAll();
    };
  }, []);

  // Request high-fidelity studio voice audition from server
  const handleGenerateStudioAudition = async () => {
    setIsLoadingStudioTts(true);
    engine.stopAll();
    setIsPlaying(false);

    try {
      const response = await fetch('/api/voice-audition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sceneNumber,
          actNumber,
          sceneTitle,
          speechRateMode,
          toneStyle,
          characterName,
          voiceActorKey: 'vu_hung',
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tải giọng đọc từ server.');
      }

      const data = await response.json();
      if (data.audioBase64) {
        setStudioAudioBase64(data.audioBase64);
        setAudioSource('studio');
        setProducerReport(data.auditionDirectorReport);
        // Automatically play
        playStudioAudio(data.audioBase64);
      } else {
        // Fallback to client audio engine with same master voice
        setAudioSource('web_synth');
        setProducerReport(data.auditionDirectorReport);
        handlePlayWebSynth();
      }
    } catch (err) {
      console.warn('Fallback to web synth due to network:', err);
      setAudioSource('web_synth');
      handlePlayWebSynth();
    } finally {
      setIsLoadingStudioTts(false);
    }
  };

  const playStudioAudio = (b64: string) => {
    setIsPlaying(true);
    const audio = engine.playStudioWav(
      b64,
      () => {
        setIsPlaying(false);
        setProgress(0);
      },
      (p) => setProgress(p)
    );
    audio.playbackRate = playbackSpeed;
  };

  const playMasterMp3Audio = () => {
    if (!masterMp3Voice) return;
    setIsPlaying(true);
    setAudioSource('master_mp3');

    // Calibrate speed to knot
    const rate = knot.rateMultiplier;
    const audio = engine.playMasterAudio(
      rate,
      () => {
        setIsPlaying(false);
        setProgress(0);
      },
      (p) => setProgress(p)
    );

    if (!audio) {
      setIsPlaying(false);
    }
  };

  const handlePlayWebSynth = () => {
    setIsPlaying(true);
    setAudioSource('web_synth');
    const ok = engine.speakUnifiedWebVoice(
      text,
      sceneNumber,
      speechRateMode,
      () => {
        setIsPlaying(false);
        setCurrentCharIndex(null);
      },
      (charIdx) => {
        setCurrentCharIndex(charIdx);
      }
    );

    if (!ok) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      engine.stopAll();
      setIsPlaying(false);
      setProgress(0);
      setCurrentCharIndex(null);
    } else {
      if (masterMp3Voice && audioSource === 'master_mp3') {
        playMasterMp3Audio();
      } else if (studioAudioBase64 && audioSource === 'studio') {
        playStudioAudio(studioAudioBase64);
      } else {
        handlePlayWebSynth();
      }
    }
  };

  const handleDownloadWav = () => {
    if (!studioAudioBase64) return;
    const link = document.createElement('a');
    link.href = `data:audio/wav;base64,${studioAudioBase64}`;
    link.download = `Scene-${sceneNumber}-Audition-${characterName.replace(/\s+/g, '_')}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-amber-600/50 p-4 space-y-3 shadow-xl relative overflow-hidden">
      {/* Top Banner: Master Narrator Lock (100% Locked Voice Identity) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            {masterMp3Voice ? <Music className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-serif font-bold text-amber-200">
                Phòng Thu Đọc Thử Giọng (Voice Audition)
              </span>

              {masterMp3Voice ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/70 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  DÙNG 100% GIỌNG FILE MP3: {masterMp3Voice.fileName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  KHÓA 1 NGƯỜI DẪN CHUYỆN (100% CẢ 4 HỒI)
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Nguồn giọng: <strong className="text-amber-300">{masterMp3Voice ? `File MP3 Gốc: ${masterMp3Voice.fileName}` : MASTER_NARRATOR.name}</strong> ({masterMp3Voice?.analyzedProfile?.timbre || MASTER_NARRATOR.timbre})
            </p>
          </div>
        </div>

        {/* Expand Details Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
        >
          <span>{isExpanded ? 'Thu gọn chỉ đạo' : 'Chỉ đạo diễn xuất'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Knot & Pacing Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Nút Thắt Kịch Tính:
          </span>
          <p className="text-[11px] text-stone-200 font-medium truncate" title={knot.knotName}>
            {knot.knotName}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
            Tốc Độ Phát Thanh Viên:
          </span>
          <p className="text-[11px] text-stone-200 font-mono font-bold">
            {cps} ký tự/giây ({speechRateMode === 'slow' ? '11 k/s: Bi tráng' : speechRateMode === 'fast' ? '15 k/s: Chiến trận' : '13 k/s: Chuẩn tài liệu'})
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
            Tông Điệu & Thời Gian Ước Tính:
          </span>
          <p className="text-[11px] text-stone-200 font-mono">
            {text.length} ký tự ~ <strong className="text-amber-300">{estimatedSeconds} giây</strong> ({toneStyle})
          </p>
        </div>
      </div>

      {/* Expanded Audio Producer Directorial Guidance */}
      {isExpanded && (
        <div className="p-3 rounded-lg bg-stone-950/90 border border-amber-800/40 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Chỉ Đạo Diễn Xuất Giọng Đọc Của Giám Đốc Âm Thanh:</span>
          </div>
          <p className="text-stone-300 leading-relaxed font-serif pl-1">
            <strong>Ngữ điệu & Sắc thái:</strong> {producerReport?.actingNote || knot.actingNote}
          </p>
          <p className="text-amber-200/90 font-mono text-[11px] pl-1">
            <strong>Điểm lấy hơi & Ngắt nghỉ:</strong> {producerReport?.breathPoint || knot.breathPoint}
          </p>
          {masterMp3Voice && (
            <p className="text-emerald-300 font-mono text-[11px] pl-1 border-t border-stone-800 pt-1">
              <strong>Thích ứng giọng MP3 gốc:</strong> Điều chỉnh nhịp đọc đạt chuẩn {cps} cps tương ứng nút thắt #{sceneNumber}.
            </p>
          )}
        </div>
      )}

      {/* Playback Controls & Waveform Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* If Master MP3 is loaded, provide dedicated Play MP3 button */}
          {masterMp3Voice ? (
            <button
              type="button"
              onClick={() => {
                if (isPlaying && audioSource === 'master_mp3') {
                  handleTogglePlay();
                } else {
                  playMasterMp3Audio();
                }
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isPlaying && audioSource === 'master_mp3'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 shadow-emerald-950/60'
              }`}
            >
              {isPlaying && audioSource === 'master_mp3' ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Dừng Giọng MP3 Gốc</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Đọc Bằng Giọng MP3 Gốc</span>
                </>
              )}
            </button>
          ) : (
            /* Main Play / Stop Button */
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isLoadingStudioTts}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-950/60'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Dừng Đọc Thử</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Đọc Thử Giọng ({MASTER_NARRATOR.name})</span>
                </>
              )}
            </button>
          )}

          {/* Studio TTS High-Fidelity Button */}
          <button
            type="button"
            onClick={handleGenerateStudioAudition}
            disabled={isLoadingStudioTts}
            className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-600/70 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Tạo bản thu âm chất lượng cao từ Gemini Studio TTS với đúng người dẫn chuyện Vũ Hùng"
          >
            {isLoadingStudioTts ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {isLoadingStudioTts
                ? 'Đang Thu Âm Studio...'
                : studioAudioBase64
                ? 'Thu Âm Lại (Studio)'
                : 'Thu Âm Studio (Gemini AI)'}
            </span>
          </button>

          {/* Quick Web Voice Trigger if MP3 is loaded */}
          {masterMp3Voice && (
            <button
              type="button"
              onClick={() => {
                if (isPlaying && audioSource === 'web_synth') {
                  handleTogglePlay();
                } else {
                  handlePlayWebSynth();
                }
              }}
              className="px-2.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Đọc thử bằng bộ tổng hợp giọng nói chuẩn Web Audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Synth Live</span>
            </button>
          )}

          {/* Download Button if Studio Audio is ready */}
          {studioAudioBase64 && (
            <button
              type="button"
              onClick={handleDownloadWav}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors"
              title="Tải tệp âm thanh bản đọc thử (.wav)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-950/80 border border-stone-800">
          <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-stone-600'}`} />
          <div className="flex items-end gap-0.5 h-4">
            {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50].map((height, i) => (
              <div
                key={i}
                style={{
                  height: isPlaying ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 100)}%` : '20%',
                  transition: 'height 0.15s ease',
                }}
                className={`w-1 rounded-full ${
                  isPlaying ? (audioSource === 'master_mp3' ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-stone-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-stone-400 ml-1">
            {isPlaying
              ? audioSource === 'master_mp3'
                ? 'Giọng MP3 Gốc'
                : audioSource === 'studio'
                ? 'Studio WAV 24kHz'
                : 'Voice Synth'
              : 'Sẵn Sàng'}
          </span>
        </div>
      </div>

      {/* Realtime Teleprompter Word Sync Preview */}
      <div className="p-3 rounded-lg bg-stone-950/90 border border-stone-800 text-xs font-serif leading-relaxed text-stone-300 max-h-32 overflow-y-auto">
        <span className="text-[10px] font-mono text-amber-400 block mb-1 uppercase tracking-wider font-sans">
          Lời bình đồng bộ phòng thu ({masterMp3Voice ? `Giọng MP3 Gốc: ${masterMp3Voice.fileName}` : `Giọng đọc ${MASTER_NARRATOR.name}`}):
        </span>
        {currentCharIndex !== null ? (
          <div>
            <span className="text-amber-300 font-bold bg-amber-950/60 px-1 rounded border border-amber-600/40">
              {text.slice(0, currentCharIndex + 25)}
            </span>
            <span className="text-stone-400 opacity-80">
              {text.slice(currentCharIndex + 25)}
            </span>
          </div>
        ) : (
          <p className="line-clamp-3 italic text-stone-300">{text}</p>
        )}
      </div>
    </div>
  );
};
