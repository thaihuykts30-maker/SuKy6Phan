import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Square, X, Type, FastForward, Activity, Clock, Sliders, ChevronRight } from 'lucide-react';
import { MasterScriptProject } from '../types/script';

interface TeleprompterViewProps {
  project: MasterScriptProject;
  onClose: () => void;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({ project, onClose }) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.5);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('xl');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [readingTimerSeconds, setReadingTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Initialize Speech Voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Find Vietnamese voice or default
        const viIndex = voices.findIndex((v) => v.lang.includes('vi') || v.lang.includes('VN'));
        if (viIndex !== -1) setSelectedVoiceIndex(viIndex);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Reading Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setReadingTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollContainer) {
        scrollContainer.scrollTop += (scrollSpeed * 0.045) * delta;
      }
      scrollAnimRef.current = requestAnimationFrame(scrollLoop);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Clean TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartStop = () => {
    const nextState = !isAutoScrolling;
    setIsAutoScrolling(nextState);
    setIsTimerRunning(nextState);
  };

  const handleReset = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setIsAutoScrolling(false);
    setIsTimerRunning(false);
    setReadingTimerSeconds(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    }
  };

  // Compile full voiceover narration text
  const getAllNarration = () => {
    const lines: {
      id: string;
      actNumber: number;
      actTitle: string;
      sceneNumber: number;
      title: string;
      text: string;
      pacingNote?: string;
    }[] = [];

    // Act 1 Hook first
    lines.push({
      id: 'act1-hook',
      actNumber: 1,
      actTitle: project.act1.actTitle,
      sceneNumber: 0,
      title: 'LƯỠI CÂU MỞ ĐẦU (HOOK)',
      text: project.act1.hook.openingStatement,
      pacingNote: project.act1.hook.voiceoverTone,
    });

    project.act1.scenes.forEach((s) =>
      lines.push({
        id: `s-${s.sceneNumber}`,
        actNumber: 1,
        actTitle: project.act1.actTitle,
        sceneNumber: s.sceneNumber,
        title: s.title,
        text: s.narration,
        pacingNote: s.pacingNote,
      })
    );

    project.act2.scenes.forEach((s) =>
      lines.push({
        id: `s-${s.sceneNumber}`,
        actNumber: 2,
        actTitle: project.act2.actTitle,
        sceneNumber: s.sceneNumber,
        title: s.title,
        text: s.narration,
        pacingNote: s.pacingNote,
      })
    );

    project.act3.scenes.forEach((s) =>
      lines.push({
        id: `s-${s.sceneNumber}`,
        actNumber: 3,
        actTitle: project.act3.actTitle,
        sceneNumber: s.sceneNumber,
        title: s.title,
        text: s.narration,
        pacingNote: s.pacingNote,
      })
    );

    project.act4.scenes.forEach((s) =>
      lines.push({
        id: `s-${s.sceneNumber}`,
        actNumber: 4,
        actTitle: project.act4.actTitle,
        sceneNumber: s.sceneNumber,
        title: s.title,
        text: s.narration,
        pacingNote: s.pacingNote,
      })
    );

    // Closing reflection
    lines.push({
      id: 'act4-outro',
      actNumber: 4,
      actTitle: project.act4.actTitle,
      sceneNumber: 99,
      title: 'LỜI BÌNH KẾT LUẬN & SUY NGẪM THIÊN THU',
      text: project.act4.closingReflection,
      pacingNote: 'Thanh thoát, sâu lắng, lay động tâm can',
    });

    return lines;
  };

  const narrationLines = getAllNarration();

  const [ttsNotification, setTtsNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setTtsNotification(msg);
    setTimeout(() => setTtsNotification(null), 3000);
  };

  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      showNotification('Trình duyệt chưa hỗ trợ Web Speech API.');
      return;
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = narrationLines.map((n) => n.text).join(' ... ');
    const utterance = new SpeechSynthesisUtterance(fullText);

    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.lang = 'vi-VN';
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlayingTTS(false);
      setIsAutoScrolling(false);
    };
    utterance.onerror = () => {
      setIsPlayingTTS(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
    setIsAutoScrolling(true);
    setIsTimerRunning(true);
  };

  const scrollToAct = (actNum: number) => {
    const targetElement = document.getElementById(`act-marker-${actNum}`);
    if (targetElement && containerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'base':
        return 'text-base sm:text-lg leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'xl':
        return 'text-xl sm:text-2xl leading-loose';
      case '2xl':
        return 'text-2xl sm:text-3xl leading-loose';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col animate-in fade-in duration-200">
      {ttsNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-amber-600 text-stone-950 font-bold text-xs shadow-2xl animate-in fade-in duration-150">
          {ttsNotification}
        </div>
      )}
      {/* Top Teleprompter Control Bar */}
      <div className="bg-stone-900/95 border-b border-stone-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-600/50 flex items-center justify-center text-rose-300">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200">
              Phòng Thu Voiceover & Máy Nhắc Chữ
            </h3>
            <p className="text-[11px] text-stone-400">
              {project.profile.characterName} • Chuẩn thời lượng {project.profile.targetDurationMinutes} phút
            </p>
          </div>
        </div>

        {/* Center: Live Timer & Act Fast Jump */}
        <div className="flex items-center gap-2">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{formatTimer(readingTimerSeconds)}</span>
            <span className="text-stone-500">/ {project.profile.targetDurationMinutes}:00</span>
          </div>

          {/* Act Jump buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
            <span className="text-stone-500 mr-1 text-[10px] uppercase font-semibold">Tới:</span>
            {[1, 2, 3, 4].map((act) => (
              <button
                key={act}
                onClick={() => scrollToAct(act)}
                className="px-2 py-0.5 rounded text-[11px] hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
              >
                Hồi {act}
              </button>
            ))}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Start / Pause Scroll */}
          <button
            onClick={handleStartStop}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              isAutoScrolling
                ? 'bg-amber-500 text-stone-950 shadow-amber-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isAutoScrolling ? 'Tạm Dừng' : 'Bắt Đầu Đọc'}</span>
          </button>

          {/* Reset Scroll */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Làm mới lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Adjust */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-14 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-amber-300">{scrollSpeed}x</span>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
            <Type className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
            {(['base', 'lg', 'xl', '2xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  fontSize === s ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {/* TTS Read Audio */}
          <button
            onClick={handleToggleTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isPlayingTTS
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-800 hover:bg-rose-950/80 border border-rose-900/60 text-rose-300'
            }`}
          >
            {isPlayingTTS ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isPlayingTTS ? 'Dừng Giọng Đọc' : 'Đọc Thử AI'}</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Teleprompter Read Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-16 md:px-32 py-16 scroll-smooth select-text"
      >
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          {narrationLines.map((item, idx) => (
            <div
              key={item.id}
              id={item.sceneNumber === 0 || item.sceneNumber === 1 || item.sceneNumber === 4 || item.sceneNumber === 7 || item.sceneNumber === 10 ? `act-marker-${item.actNumber}` : undefined}
              className="space-y-3 p-6 rounded-2xl bg-stone-900/40 hover:bg-stone-900/80 transition-all border border-transparent hover:border-amber-900/40"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-amber-300 text-xs font-mono uppercase tracking-wider shadow-sm">
                <span>{item.actTitle}</span>
                <span>•</span>
                <span>{item.title}</span>
              </div>

              {item.pacingNote && (
                <div className="text-xs text-amber-500/80 italic font-mono">
                  Ghi chú nhịp điệu: {item.pacingNote}
                </div>
              )}

              <p className={`font-serif text-stone-100 font-medium ${getFontSizeClass()} transition-all`}>
                "{item.text}"
              </p>
            </div>
          ))}

          <div className="pt-24 pb-36 text-stone-600 text-sm italic font-serif">
            — HẾT TOÀN VĂN KỊCH BẢN THỜI LƯỢNG {project.profile.targetDurationMinutes} PHÚT —
          </div>
        </div>
      </div>
    </div>
  );
};
