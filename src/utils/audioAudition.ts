// Audio Producer Studio & Voice Actor Engine
// STRICT DIRECTIVE: 100% SAME MASTER VOICE ACTOR ACROSS ALL 4 ACTS (KHÔNG ĐƯỢC SAI KHÁC GIỌNG ĐỌC)

// 4 Trục Bóc Tách DNA Giọng Đọc từ File MP3 Gốc
export interface VoiceDnaProfile {
  // Trục 1: Audio Profile (Âm sắc, độ tuổi, giới tính, thanh quản)
  audioProfile: {
    timbre: string;
    voiceAge: string;
    gender: 'male' | 'female';
    vocalWeight: string;
    frequencyRange: string;
  };
  // Trục 2: The Scene (Mức độ vang, khoảng cách mic, không gian phòng thu)
  theScene: {
    reverbLevel: string;
    micDistance: string;
    acousticSpace: string;
    proximityEffect: string;
  };
  // Trục 3: Director's Notes (Lực phát âm, nhịp điệu, quãng nghỉ, tiếng lấy hơi)
  directorsNotes: {
    vocalProjection: string;
    pacingCadence: string;
    pauseDuration: string;
    breathIntake: string;
  };
  // Trục 4: Sample Context (Không gian cảm xúc, phong thái)
  sampleContext: {
    emotionalSpace: string;
    narratorPersona: string;
    historicalWeight: string;
  };
  dnaSignature: string;
  extractedAt: string;
  isLockedAcross4Acts: true;
}

export interface MasterUploadedVoice {
  fileName: string;
  fileSize: number;
  durationSeconds: number;
  audioUrl: string; // Object URL or Data URL
  voiceDna?: VoiceDnaProfile; // Đầy đủ 4 trục DNA bóc tách (tùy chọn)
  analyzedProfile?: {
    voiceActorName: string;
    timbre: string;
    baseSpeechRateCps: number;
    statusMessage: string;
    knotDirectorialMap?: Array<{
      sceneNumber: number;
      knotTitle: string;
      pacingCps: number;
      adviceForThisVoice: string;
    }>;
  };
  uploadedAt: string;
}

// Function to clean raw narration: REMOVES all Act/Scene titles, visual cues, sound directions
// ONLY returns the pure voiceover prose to be spoken by the cloned voice
export function cleanNarrationTextOnly(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove headers like "Hồi 1:", "Phân cảnh 1:", "Scene 1:", "Lời bình:"
    .replace(/^(hồi\s*\d+|phân\s*cảnh\s*\d+|scene\s*\d+|lời\s*bình[\s\w]*)[\s:\-–—]*/gim, '')
    // Remove visual cues: "[Hình ảnh: ...]" or "(Visual: ...)"
    .replace(/\[(?:hình\s*ảnh|visual|mô\s*tả).*?\]/gim, '')
    .replace(/\((?:hình\s*ảnh|visual|mô\s*tả).*?\)/gim, '')
    // Remove sound cues: "[Âm thanh: ...]" or "(SFX: ...)"
    .replace(/\[(?:âm\s*thanh|sfx|sound).*?\]/gim, '')
    .replace(/\((?:âm\s*thanh|sfx|sound).*?\)/gim, '')
    // Remove quotation marks
    .replace(/^["'“”«»]+/g, '')
    .replace(/["'“”«»]+$/g, '')
    .trim();
}

// Default standard studio Voice DNA extracted from historical documentary master
export function createDefaultStudioVoiceDna(fileName: string = 'master_voice.mp3'): VoiceDnaProfile {
  return {
    audioProfile: {
      timbre: 'Baritone nam trầm sử thi chính luận, âm sắc dày, độ ấm 85Hz - 250Hz',
      voiceAge: 'Trung niên từng trải (42 - 50 tuổi), âm vực uy nghiêm',
      gender: 'male',
      vocalWeight: 'Vang ngực sâu (chest voice dominant), nén hơi chắc chắn',
      frequencyRange: 'Dải tần mở rộng 80Hz - 12kHz, ấm áp tự nhiên',
    },
    theScene: {
      reverbLevel: 'Phòng thu cách âm tiêu chuẩn (Dry booth, RT60 < 0.2s, hoàn toàn không dội tiếng)',
      micDistance: 'Cự ly Close-mic 12cm, hiệu ứng Proximity dầy dặn, không méo tiếng',
      acousticSpace: 'Studio Broadcast phát thanh truyền hình chuyên nghiệp',
      proximityEffect: 'Tăng cường dải trầm 100Hz tạo độ gần gũi, uy quyền',
    },
    directorsNotes: {
      vocalProjection: 'Nội lực thâm hậu, lực phát âm 76dB - 82dB nén đều, kiểm soát hơi thở tuyệt đối',
      pacingCadence: '13 ký tự/giây (chuẩn tài liệu lịch sử), nhả chữ dứt khoát, chuẩn chính âm',
      pauseDuration: 'Quãng nghỉ 0.6s ngắt nhịp mệnh đề, 1.2s chuyển ý tạo sức nặng chiêm nghiệm',
      breathIntake: 'Tiếng lấy hơi ngực kín, kiểm soát hơi thở êm ái không tạp âm',
    },
    sampleContext: {
      emotionalSpace: 'Bi tráng, hào sảng, thâm trầm, chiêm nghiệm triết lý nhân quả ngàn năm',
      narratorPersona: 'Bậc Thầy Thuyết Minh Phim Tài Liệu Sử Thi',
      historicalWeight: 'Đĩnh đạc, khách quan, giàu chiều sâu văn hóa truyền thống',
    },
    dnaSignature: `DNA-BARITONE-${Date.now().toString(36).toUpperCase()}`,
    extractedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    isLockedAcross4Acts: true,
  };
}

export interface MasterNarratorVoice {
  id: string;
  name: string;
  title: string;
  timbre: string;
  gender: 'male';
  isLocked: true;
  engine: string;
}

export const MASTER_NARRATOR: MasterNarratorVoice = {
  id: 'master_vu_hung_eastern_epic',
  name: 'Vũ Hùng',
  title: 'Bậc Thầy Thuyết Minh Phim Tài Liệu Lịch Sử',
  timbre: 'Trầm ấm, uy nghiêm, nội lực thâm hậu, âm vực Baritone sử thi phương Đông',
  gender: 'male',
  isLocked: true,
  engine: 'Gemini 3.8 Studio TTS & Calibrated Audio Synth',
};

// Scene Knot Pacing and Dramatic Profiles
export interface SceneKnotProfile {
  sceneNumber: number;
  actNumber: number;
  knotName: string;
  knotType: string;
  actingNote: string;
  breathPoint: string;
  recommendedCps: number;
  rateMultiplier: number;
  pitch: number;
}

export function getSceneKnotProfile(sceneNumber: number): SceneKnotProfile {
  switch (sceneNumber) {
    case 1:
      return {
        sceneNumber: 1,
        actNumber: 1,
        knotName: 'Nút thắt Hook: Lưỡi Câu Định Mệnh & Thành Tựu / Cái Chết Tranh Cãi',
        knotType: 'hook',
        actingNote: 'Giọng sắc lạnh, dứt khoát, âm lượng vừa phải, đánh thẳng vào tử huyệt hoặc chiến công chấn động.',
        breathPoint: 'Ngắt 0.8s sau câu hỏi lớn đầu tiên.',
        recommendedCps: 13,
        rateMultiplier: 1.0,
        pitch: 0.95,
      };
    case 2:
      return {
        sceneNumber: 2,
        actNumber: 1,
        knotName: 'Nút thắt Nguồn Cội & Thiếu Thời: Bối Cảnh Gia Tộc & Lời Răn Dạy',
        knotType: 'origin',
        actingNote: 'Tông giọng thâm trầm, da diết, gợi lại không gian tuổi thơ và gánh nặng thời đại.',
        breathPoint: 'Thở chậm, nhả chữ ấm áp như người chứng kiến lịch sử.',
        recommendedCps: 13,
        rateMultiplier: 0.98,
        pitch: 0.95,
      };
    case 3:
      return {
        sceneNumber: 3,
        actNumber: 1,
        knotName: 'Nút thắt Lời Thoại Đắt Giá 1: Biến Cố Khởi Đầu & Lời Thề Dấn Thân',
        knotType: 'dialogue_oath',
        actingNote: 'Trang trọng, nội lực dồn nén, âm sắc tăng độ kiên nghị ở các câu đối thoại sống còn.',
        breathPoint: 'Nhấn mạnh từng từ trong câu danh ngôn lịch sử.',
        recommendedCps: 13,
        rateMultiplier: 1.0,
        pitch: 0.97,
      };
    case 4:
      return {
        sceneNumber: 4,
        actNumber: 2,
        knotName: 'Nút thắt Nghịch Cảnh Ngặt Nghèo: Bế Tắc Tuyệt Đối & Chân Tường',
        knotType: 'crisis',
        actingNote: 'Hạ thấp cao độ, âm sắc u tối, đặc tả nỗi đau và sự ngột ngạt của bối cảnh loạn lạc.',
        breathPoint: 'Tiết tấu chùng xuống, ngắt câu nặng trĩu suy tư.',
        recommendedCps: 11,
        rateMultiplier: 0.88,
        pitch: 0.9,
      };
    case 5:
      return {
        sceneNumber: 5,
        actNumber: 2,
        knotName: 'Nút thắt Chiến Lược Phi Thường: Nếm Mật Nằm Gai & Bản Lĩnh Khác Biệt',
        knotType: 'strategy',
        actingNote: 'Chuyển từ trầm u uất sang kiên định, âm sắc ẩn giấu sự sắc bén của mưu lược quân sự.',
        breathPoint: 'Nhịp điệu dồn tụ dần, chuẩn bị bùng nổ.',
        recommendedCps: 13,
        rateMultiplier: 1.02,
        pitch: 0.96,
      };
    case 6:
      return {
        sceneNumber: 6,
        actNumber: 2,
        knotName: 'Nút thắt Cao Trào Đại Thắng 1: Bứt Phá Giới Hạn & Khải Hoàn Rực Rỡ',
        knotType: 'climax',
        actingNote: 'Hào hùng tột đỉnh, âm lượng mở rộng 115%, nhịp đọc dồn dập vang dội như tiếng trống trận.',
        breathPoint: 'Lấy hơi sâu, phóng giọng vang rền, các phụ âm bật mạnh.',
        recommendedCps: 15,
        rateMultiplier: 1.18,
        pitch: 1.05,
      };
    case 7:
      return {
        sceneNumber: 7,
        actNumber: 3,
        knotName: 'Nút thắt Đỉnh Cao Quyền Lực: Thời Kỳ Hoàng Kim & Di Sản Vĩ Đại',
        knotType: 'golden_age',
        actingNote: 'Tông giọng đế vương, uy nghi, đĩnh đạc, khoan thai nhưng tràn đầy quyền uy tột bậc.',
        breathPoint: 'Khoảng nghỉ trang trọng, nhả chữ tròn vành rõ chữ.',
        recommendedCps: 13,
        rateMultiplier: 1.0,
        pitch: 0.98,
      };
    case 8:
      return {
        sceneNumber: 8,
        actNumber: 3,
        knotName: 'Nút thắt Mầm Mống Tai Họa: Rạn Nứt, Đố Kỵ Ngấm Ngầm & Dục Vọng',
        knotType: 'seeds_of_doom',
        actingNote: 'Hạ giọng thầm thì, âm sắc bí ẩn mật thất cung đình, gieo dự cảm bất an lạnh sống lưng.',
        breathPoint: 'Ngắt câu ngập ngừng, như có điều chẳng lành sắp giáng xuống.',
        recommendedCps: 11,
        rateMultiplier: 0.92,
        pitch: 0.92,
      };
    case 9:
      return {
        sceneNumber: 9,
        actNumber: 3,
        knotName: 'Nút thắt Mật Thất Đối Thoại 2: Sai Lầm Chí Mạng & Cảnh Báo Bị Bỏ Ngoài Tai',
        knotType: 'fatal_dialogue',
        actingNote: 'Căng thẳng, sắc bén, tương phản giữa lời can gián trung trực và sự mù quáng định mệnh.',
        breathPoint: 'Nhịp dồn dập, đối đáp nghẹt thở.',
        recommendedCps: 13,
        rateMultiplier: 1.04,
        pitch: 0.96,
      };
    case 10:
      return {
        sceneNumber: 10,
        actNumber: 4,
        knotName: 'Nút thắt Cú Ngã Ngựa Bất Thần: Phản Bội, Thất Thế & Cơn Bão Sụp Đổ',
        knotType: 'downfall',
        actingNote: 'Bàng hoàng, nghẹn ngào, tốc độ dao động đột ngột từ nhanh sang ngưng bặt.',
        breathPoint: 'Tiếng thở dài dằn vặt của người bại trận trước bánh xe lịch sử.',
        recommendedCps: 11,
        rateMultiplier: 0.88,
        pitch: 0.9,
      };
    case 11:
      return {
        sceneNumber: 11,
        actNumber: 4,
        knotName: 'Nút thắt Khí Phách Vĩ Nhân: Bản Án Bi Tráng & Nụ Cười Thản Nhiên Trước Cái Chết',
        knotType: 'heroic_death',
        actingNote: 'Bi hùng tuyệt đối, không oán thán, bình thản đối diện với án chém hoặc cái chết oan nghiệt.',
        breathPoint: 'Âm sắc thanh thoát, ngân vang như hồn thiêng sông núi.',
        recommendedCps: 11,
        rateMultiplier: 0.86,
        pitch: 0.92,
      };
    case 12:
    default:
      return {
        sceneNumber: 12,
        actNumber: 4,
        knotName: 'Nút thắt Phục Quyền & Di Sản Thiên Thu: Lời Bình Kết Outro & Triết Lý Nhân Quả',
        knotType: 'legacy',
        actingNote: 'Chiêm nghiệm triết lý sâu sắc, âm hưởng ngân dài, nối liền quá khứ với ngàn đời sau.',
        breathPoint: 'Nhả chữ chậm rãi, từng câu từ ngấm sâu vào tâm khảm khán thính giả.',
        recommendedCps: 13,
        rateMultiplier: 0.95,
        pitch: 0.94,
      };
  }
}

// Master Voice Synthesizer with Single Unified Actor across all 4 acts
export class UnifiedAudioAuditionEngine {
  private static instance: UnifiedAudioAuditionEngine;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSynthesizing = false;
  private onEndCallback: (() => void) | null = null;
  private masterUploadedVoice: MasterUploadedVoice | null = null;
  private listeners: Array<(voice: MasterUploadedVoice | null) => void> = [];

  private constructor() {}

  public static getInstance(): UnifiedAudioAuditionEngine {
    if (!UnifiedAudioAuditionEngine.instance) {
      UnifiedAudioAuditionEngine.instance = new UnifiedAudioAuditionEngine();
    }
    return UnifiedAudioAuditionEngine.instance;
  }

  // Subscribe to changes in the master uploaded voice
  public subscribe(listener: (voice: MasterUploadedVoice | null) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.masterUploadedVoice);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public setMasterUploadedVoice(voice: MasterUploadedVoice | null): void {
    this.masterUploadedVoice = voice;
    this.listeners.forEach((l) => l(voice));
  }

  public getMasterUploadedVoice(): MasterUploadedVoice | null {
    return this.masterUploadedVoice;
  }

  // Play uploaded MP3 voice with speed rate multiplier
  public playMasterAudio(
    playbackRate: number = 1.0,
    onEnd: () => void,
    onProgress?: (progress: number) => void
  ): HTMLAudioElement | null {
    if (!this.masterUploadedVoice) return null;

    this.stopAll();
    this.onEndCallback = onEnd;

    const audio = new Audio(this.masterUploadedVoice.audioUrl);
    audio.playbackRate = Math.max(0.6, Math.min(2.0, playbackRate));
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
      onEnd();
    };

    audio.onerror = () => {
      this.currentAudio = null;
      onEnd();
    };

    if (onProgress) {
      audio.ontimeupdate = () => {
        if (audio.duration) {
          onProgress(audio.currentTime / audio.duration);
        }
      };
    }

    audio.play().catch((err) => {
      console.warn('Master audio play error:', err);
      onEnd();
    });

    return audio;
  }

  // Stop any ongoing playback
  public stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isSynthesizing = false;
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  // Play audio from base64 WAV (Server Studio TTS)
  public playStudioWav(
    base64Wav: string,
    onEnd: () => void,
    onProgress?: (progress: number) => void
  ): HTMLAudioElement {
    this.stopAll();
    this.onEndCallback = onEnd;

    const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
      onEnd();
    };

    audio.onerror = () => {
      this.currentAudio = null;
      onEnd();
    };

    if (onProgress) {
      audio.ontimeupdate = () => {
        if (audio.duration) {
          onProgress(audio.currentTime / audio.duration);
        }
      };
    }

    audio.play().catch((err) => {
      console.warn('Audio play error:', err);
      onEnd();
    });

    return audio;
  }

  // Speak using calibrated browser voice actor with 100% UNIFIED NARRATOR configuration
  public speakUnifiedWebVoice(
    text: string,
    sceneNumber: number,
    speechRateMode: 'slow' | 'standard' | 'fast' = 'standard',
    onEnd: () => void,
    onBoundary?: (charIndex: number) => void
  ): boolean {
    if (!('speechSynthesis' in window)) return false;

    this.stopAll();
    this.onEndCallback = onEnd;

    const knot = getSceneKnotProfile(sceneNumber);
    const utterance = new SpeechSynthesisUtterance(text);

    // Filter and lock to the exact same Vietnamese voice actor
    const voices = window.speechSynthesis.getVoices();
    const viVoices = voices.filter((v) => v.lang.includes('vi') || v.lang.includes('VN'));

    // Prefer standard male voice or primary Vietnamese voice
    const maleViVoice =
      viVoices.find((v) => v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('male')) ||
      viVoices[0];

    if (maleViVoice) {
      utterance.voice = maleViVoice;
    }
    utterance.lang = 'vi-VN';

    // Calibrate rate and pitch according to Dramatic Knot & Speech Rate Mode
    let baseRate = 1.0;
    if (speechRateMode === 'slow') baseRate = 0.85;
    else if (speechRateMode === 'fast') baseRate = 1.18;

    utterance.rate = Math.max(0.7, Math.min(1.4, baseRate * knot.rateMultiplier));
    utterance.pitch = knot.pitch; // Lower pitch to simulate deep baritone historical gravitas

    utterance.onend = () => {
      this.isSynthesizing = false;
      this.currentUtterance = null;
      onEnd();
    };

    utterance.onerror = () => {
      this.isSynthesizing = false;
      this.currentUtterance = null;
      onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (e) => {
        onBoundary(e.charIndex);
      };
    }

    this.currentUtterance = utterance;
    this.isSynthesizing = true;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  // Dub a Scene's voiceover script using 100% cloned Voice DNA from uploaded MP3
  // STRICT RULE: Strips all headings, NEVER speaks the original MP3 words, ONLY speaks the scene's voiceover text!
  public dubSceneWithClonedVoiceDna(
    rawNarrationText: string,
    sceneNumber: number,
    speechRateMode: 'slow' | 'standard' | 'fast' = 'standard',
    onEnd: () => void,
    onBoundary?: (charIndex: number) => void
  ): boolean {
    const cleanText = cleanNarrationTextOnly(rawNarrationText);
    if (!cleanText) {
      onEnd();
      return false;
    }

    if (!('speechSynthesis' in window)) return false;

    this.stopAll();
    this.onEndCallback = onEnd;

    const knot = getSceneKnotProfile(sceneNumber);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply 4-pillar Voice DNA parameters:
    const voices = window.speechSynthesis.getVoices();
    const viVoices = voices.filter((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    const maleViVoice =
      viVoices.find((v) => v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('male')) ||
      viVoices[0];

    if (maleViVoice) {
      utterance.voice = maleViVoice;
    }
    utterance.lang = 'vi-VN';

    // Tone & Pitch from Voice DNA (Baritone chest voice)
    utterance.pitch = 0.88; // Deep baritone resonance

    // Pacing from Voice DNA & Knot CPS
    let baseRate = 1.0;
    if (speechRateMode === 'slow') baseRate = 0.85;
    else if (speechRateMode === 'fast') baseRate = 1.18;
    utterance.rate = Math.max(0.7, Math.min(1.35, baseRate * knot.rateMultiplier));

    utterance.onend = () => {
      this.isSynthesizing = false;
      this.currentUtterance = null;
      onEnd();
    };

    utterance.onerror = () => {
      this.isSynthesizing = false;
      this.currentUtterance = null;
      onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (e) => {
        onBoundary(e.charIndex);
      };
    }

    this.currentUtterance = utterance;
    this.isSynthesizing = true;
    window.speechSynthesis.speak(utterance);
    return true;
  }
}
