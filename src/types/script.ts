export interface StoryBeat {
  id: string;
  beatNumber: number; // 1, 2, 3
  type: 'opening' | 'climax' | 'resolution';
  title: string; // e.g. "Nút thắt 1 (Mở đầu bối cảnh / Gieo cảm xúc)"
  voiceoverExcerpt: string; // Trích xuất 1-2 câu lời bình có ý nghĩa trọn vẹn
  imagePrompt: string; // Cấu trúc: [Chủ thể] + [Hành động/Biểu cảm] + [Bối cảnh/Trang phục lịch sử] + [Góc máy] + [Ánh sáng] + [Phong cách]
  videoMotionPrompt: string; // Cấu trúc: [Camera movement] + [Subject movement] + [Environment dynamics]
  directorNote: string; // Ghi chú đạo diễn: Giải thích nhanh lý do chọn hình ảnh và chuyển động khớp với lời bình
}

export interface CinematicScene {
  id: string;
  sceneNumber: number;
  timestamp: string; // e.g. "00:00 - 01:15"
  durationSeconds?: number; // Thời lượng tính bằng giây
  title: string;
  narration: string; // Lời bình giọng đọc (Voiceover script)
  visualDescription?: string; // Mô tả hình ảnh tư liệu/phục dựng
  transitionNote?: string; // Ghi chú nối mạch (Seamless Flow): Logic nhân - quả hoặc dịch chuyển góc nhìn vĩ mô -> vi mô dẫn sang Scene tiếp theo
  characterCount?: number; // Số lượng ký tự thực tế (chữ, số, dấu câu, khoảng trắng)
  targetCharacterCount?: number; // Số lượng ký tự mục tiêu ăn khớp 100% thời lượng
  matchPercentage?: number; // Phần trăm ăn khớp (vd: 100%)
  storyBeats?: StoryBeat[]; // Phân tách nút thắt Đạo diễn Hình ảnh & Prompt Engineer
  imagePrompt: string; // Midjourney / Flux prompt in English
  videoPrompt: string; // Runway Gen-3 / Kling / Veo prompt in English
  audioDesign: string; // SFX & Sound ambience cues
  pacingNote: string; // Gợi ý nhịp dựng phim: Dồn dập, chậm rãi, tĩnh lặng...
  masterVoiceAttached?: {
    fileName: string;
    sourceType: 'master_mp3';
    audioUrl?: string;
    timbre?: string;
    appliedAt: string;
    pacingCps?: number;
  };
}

export interface PartSectionConfig {
  partIndex: 1 | 2 | 3 | 4 | 5 | 6;
  partKey: string;
  partTitle: string; // "PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG"
  shortTitle: string; // "1. The Hook - Lời tựa gây chấn động"
  durationPercentage: string; // "10-15%"
  defaultDurationText: string; // "3 phút (~10-15%)"
  targetSeconds: number; // 180s
  objective: string;
  sampleStructure: {
    voTone: string;
    voFormula: string;
    dialogueFormula: string;
    outroVoFormula: string;
  };
  sceneNumbers: [number, number];
}

export interface PartSectionData {
  partIndex: 1 | 2 | 3 | 4 | 5 | 6;
  partKey: string;
  partTitle: string;
  shortTitle: string;
  durationPercentage: string;
  partDuration: string;
  objective: string;
  sampleStructure: {
    voTone: string;
    voFormula: string;
    dialogueFormula: string;
    outroVoFormula: string;
  };
  scenes: CinematicScene[];
}

export interface Act1Data {
  actTitle: string; // "Hồi 1: Lưỡi câu và Nguồn cội"
  actDuration: string; // "Khoảng 3 - 5 phút"
  hook: {
    openingStatement: string; // Câu kết luận sắc bén nhất (không ngày sinh)
    voiceoverTone: string;
    hookVisualPrompt: string;
  };
  originAndCore: {
    familyAndSocialContext: string;
    definingYouthEvent: string;
    corePhilosophy: string;
  };
  goldenDialogue1: {
    characters: string;
    setting: string;
    dialogueText: string;
    dramaticSignificance: string;
  };
  scenes: CinematicScene[];
  actTransitionCliffhanger?: string; // Câu chốt Hồi 1 - Gieo mồi lửa / mâu thuẫn dẫn sang Hồi 2
}

export interface Act2Data {
  actTitle: string; // "Hồi 2: Chớp thời cơ và Chinh phục"
  actDuration: string; // "Khoảng 10 - 12 phút"
  painPointAndCrisis: string;
  distinctStrategy: string;
  hardshipJourney: string;
  climax1: string; // Hoàn thành mục tiêu bước đầu
  scenes: CinematicScene[];
  actTransitionCliffhanger?: string; // Câu chốt Hồi 2 - Gieo mồi lửa / vấn đề chuyển giao sang Hồi 3
}

export interface Act3Data {
  actTitle: string; // "Hồi 3: Đỉnh cao quyền lực và Mầm mống tai họa"
  actDuration: string; // "Khoảng 8 - 10 phút"
  goldenAge: string;
  seedsOfDoom: string; // Yếu tố then chốt: rạn nứt, đố kỵ, sai lầm
  goldenDialogue2: {
    characters: string;
    setting: string;
    dialogueText: string;
    dramaticSignificance: string;
  };
  scenes: CinematicScene[];
  actTransitionCliffhanger?: string; // Câu chốt Hồi 3 - Báo hiệu giông bão sụp đổ dẫn sang Hồi 4
}

export interface Act4Data {
  actTitle: string; // "Hồi 4: Cú ngã ngựa và Di sản thiên thu"
  actDuration: string; // "Khoảng 5 - 7 phút"
  cataclysmicEvent: string; // Biến cố chấn động không thể vãn hồi
  tragicEnd: string; // Kết cục bi thương & tâm thế vĩ nhân
  redemptionAndLegacy: string; // Đánh giá lịch sử & bài học
  closingReflection: string; // Lời bình kết khơi gợi suy ngẫm (Call to Action / Thought-provoking)
  scenes: CinematicScene[];
}

export interface DirectorSixPartAnalysis {
  historicalEraAndContext: string; // 1/ Thời Đại / Bối Cảnh Lịch Sử (100% Chính Sử)
  durationBreakdown: {             // 2/ Thời Lượng Phân Bổ (30-40 phút, 900 ký tự/phút)
    totalDuration: string;         // VD: 34 phút, 35 phút...
    totalMinutes: number;          // số phút
    act1NameAndSummary: string;    // Phần 1 & 2: Tên & tóm tắt sự kiện
    act2NameAndSummary: string;    // Phần 3: Tên & tóm tắt sự kiện
    act3NameAndSummary: string;    // Phần 4 & 5: Tên & tóm tắt sự kiện
    act4NameAndSummary: string;    // Phần 6: Tên & tóm tắt sự kiện
  };
  voiceoverPacingTech: {           // 3/ Tốc độ phát thanh viên (Giọng đọc: chuẩn 900 ký tự/phút ~ 15 cps)
    speedMode: 'standard' | 'slow' | 'fast';
    cps: number;                   // 15 cps (900 ký tự/phút)
    analysis: string;              // Phân tích kỹ thuật đọc và nhịp độ áp dụng vào các phân đoạn
  };
  directorStyleAndTone: {          // 4/ Phong Cách & Tông Giọng Đạo Diễn
    styleKey: 'epic-tragic' | 'dark-strategy' | 'philosophical-karmic' | 'raw-documentary';
    styleName: string;
    keywords: string[];            // Từ khóa phong cách
    applicationGuide: string;      // Cách áp dụng lột tả khí chất
  };
  actEmotionMusicRatio: {          // 5/ Tỉ lệ cảm xúc 6 phần
    heroicPercent: number;         // VD: 60
    tragicPercent: number;         // VD: 40
    actAtmosphereAndMusic: string; // Miêu tả bầu không khí, định hướng âm nhạc (nhạc cụ, nhịp điệu) và cảm xúc chủ đạo
  };
  specialPerspectives: string[];   // 6/ Góc nhìn khai thác đặc biệt (1-2 góc nhìn mới lạ, tâm lý, phá cách)
  sixPartTemplates?: {             // Cấu trúc mẫu biên kịch (Voiceover & Dialogue) cho từng phần
    part1Hook?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
    part2PastWound?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
    part3CrazyIdea?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
    part4PowerPeak?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
    part5BlindSpot?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
    part6TheFall?: { voTone: string; voIntro: string; dialogue: string; voOutro: string };
  };
  fullFormattedText: string;       // Văn bản hoàn chỉnh theo đúng format 1/ đến 6/
}

export interface HistoricalProfile {
  characterName: string;
  otherNames?: string;
  era: string; // Thời kỳ / Triều đại
  historicalRole: string; // Danh xưng / Vị trí lịch sử
  coreArchetype: string; // Hình mẫu nhân vật
  lifePhilosophy: string; // Triết lý sống
  innerConflict: string; // Mâu thuẫn nội tâm
  fatalFlawOrHubris: string; // Điểm yếu chí mạng / Mầm mống bi kịch
  heroicTragicRatio: {
    heroicPercent: number; // e.g. 60
    tragicPercent: number; // e.g. 40
  };
  targetDurationMinutes: number; // 20 - 35
  visualStyle: string; // Bảng màu, phong cách điện ảnh
  directorSixPartAnalysis?: DirectorSixPartAnalysis;
}

export interface ProductionPackage {
  youtubeMetadata: {
    viralTitles: string[];
    thumbnailConcepts: string[];
    videoDescriptionTemplate: string;
    tags: string[];
  };
  colorPalette: {
    act1Color: string;
    act2Color: string;
    act3Color: string;
    act4Color: string;
    overallMood: string;
  };
  musicRecommendations: {
    openingTrackMood: string;
    battleTrackMood: string;
    climaxTrackMood: string;
    tragicTrackMood: string;
  };
}

export interface MasterScriptProject {
  id: string;
  title: string;
  createdAt: string;
  profile: HistoricalProfile;
  act1: Act1Data;
  act2: Act2Data;
  act3: Act3Data;
  act4: Act4Data;
  parts?: PartSectionData[];
  production: ProductionPackage;
  directorSixPartAnalysis?: DirectorSixPartAnalysis;
  generationProgress?: {
    currentStage: 'parts_1_2_completed' | 'parts_3_4_completed' | 'all_completed';
    nextStage: 'parts_3_4' | 'parts_5_6' | null;
  };
}

export interface GenerationParams {
  characterName: string;
  eraOrContext?: string;
  targetDurationMinutes: number; // 30 - 40 phút
  heroicTragicRatio: number; // 0 to 100 (percentage heroic, remainder tragic)
  toneStyle: 'epic-tragic' | 'dark-strategy' | 'philosophical-karmic' | 'raw-documentary';
  customFocalAngle?: string;
  speechRateMode?: 'slow' | 'standard' | 'fast'; // Tốc độ đọc: 13, 15, 17 cps
  directorSixPartAnalysis?: DirectorSixPartAnalysis;
  generationMode?: 'parts_1_2' | 'all_parts'; // Chiến lược viết chi tiết từng phần tránh AI cắt xén
}
