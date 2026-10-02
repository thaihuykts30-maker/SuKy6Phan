import { MasterScriptProject, CinematicScene, Act1Data, Act2Data, Act3Data, Act4Data, ProductionPackage } from '../types/script';
import { MASTER_SCENE_ALLOCATIONS, parseTimestampToSeconds, DEFAULT_CHARS_PER_SECOND } from './pacing';

export interface ImportSummary {
  fileName: string;
  fileSize: number;
  formatDetected: 'json' | 'markdown' | 'text';
  characterName: string;
  totalScenesMapped: number;
  totalCharactersNarration: number;
  actsMapped: number;
  notes: string[];
}

export interface ImportResult {
  project: MasterScriptProject;
  summary: ImportSummary;
}

function createDefaultProductionPackage(characterName: string, title: string, descriptionTemplate: string = ''): ProductionPackage {
  return {
    youtubeMetadata: {
      viralTitles: [
        title,
        `${characterName} - Bản Án Lịch Sử & Đại Khí Ngàn Năm`,
        `Hồ Sơ Toàn Cảnh: Cuộc Đời Bi Tráng Của ${characterName}`,
      ],
      thumbnailConcepts: [
        `Cận cảnh gương mặt ${characterName} nghiêm nghị giữa bão lửa, ánh mắt quắc thước`,
        `Thanh bảo kiếm cắm trên chiến lũy và lá cờ đại quân bay trong gió`,
      ],
      videoDescriptionTemplate:
        descriptionTemplate ||
        `Kịch bản phim tài liệu lịch sử đỉnh cao về cuộc đời và sự nghiệp của ${characterName}.\nCấu trúc 6 Phần chính chuẩn điện ảnh (12 Phân Cảnh): The Hook - Vết Thương Quá Khứ - Ý Tưởng Điên Rồ - Đỉnh Cao - Điểm Mù - Sự Sụp Đổ & Bài Học Nhân Sinh.`,
      tags: [characterName, 'lịch sử', 'phim tài liệu', 'sử ký 6 phần', 'voiceover', 'điện ảnh'],
    },
    colorPalette: {
      act1Color: '#b45309',
      act2Color: '#b91c1c',
      act3Color: '#4338ca',
      act4Color: '#1e293b',
      overallMood: 'Ánh sáng điện ảnh phương Đông, tone màu trầm hùng pha lẫn bi tráng',
    },
    musicRecommendations: {
      openingTrackMood: 'Đàn bầu, sấm chớp, âm sắc thâm trầm mở đầu',
      battleTrackMood: 'Trống trận Lam Sơn dồn dập, hào khí ngút trời',
      climaxTrackMood: 'Nhã nhạc cung đình kết hợp bè cello đục ngầu dự báo hiểm họa',
      tragicTrackMood: 'Tiếng sáo tiêu đơn độc da diết giữa màn mưa bi kịch',
    },
  };
}

// Generate fallback scene structure with standard allocation
function createDefaultScene(sceneNum: number): CinematicScene {
  const alloc = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === sceneNum) || {
    sceneNumber: sceneNum,
    defaultTitle: `Phân cảnh ${sceneNum}`,
    timestamp: '00:00 - 01:15',
    durationSeconds: 75,
    targetCharactersStandard: 75 * DEFAULT_CHARS_PER_SECOND,
  };

  return {
    id: `scene-${sceneNum}-${Date.now()}`,
    sceneNumber: sceneNum,
    title: alloc.defaultTitle,
    timestamp: alloc.timestamp,
    durationSeconds: alloc.durationSeconds,
    narration: '',
    transitionNote: '',
    visualDescription: '',
    imagePrompt: `Cinematic historical scene, photorealistic, 8k, DSLR, sharp focus --ar 16:9`,
    videoPrompt: `Slow cinematic dolly push-in, subtle breathing, dramatic ambient lighting`,
    audioDesign: `Nhạc nền sử thi trầm hùng xen lẫn tiếng gió đại ngàn`,
    pacingNote: `Nhịp điệu phim tài liệu chuẩn`,
    characterCount: 0,
    targetCharacterCount: alloc.targetCharactersStandard,
    matchPercentage: 0,
    storyBeats: [],
  };
}

// Ensure all 12 scenes are present and enriched with live pacing
function validateAndEnrichAllScenes(project: MasterScriptProject): MasterScriptProject {
  const enrichList = (scenes: CinematicScene[], expectedNums: number[]): CinematicScene[] => {
    return expectedNums.map((num) => {
      const existing = scenes.find((s) => Number(s.sceneNumber) === num);
      const scene = existing || createDefaultScene(num);
      const alloc = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === num);
      const timestamp = scene.timestamp || (alloc ? alloc.timestamp : '00:00 - 01:15');
      const { durationSec } = parseTimestampToSeconds(timestamp);
      const narration = (scene.narration || '').trim();
      const exactCharCount = narration.length;
      const targetCharCount = alloc ? alloc.targetCharactersStandard : Math.round(durationSec * DEFAULT_CHARS_PER_SECOND);
      const matchPercentage = targetCharCount > 0 ? Math.round((exactCharCount / targetCharCount) * 100) : 100;

      return {
        ...scene,
        id: scene.id || `scene-${num}`,
        sceneNumber: num,
        timestamp,
        durationSeconds: durationSec,
        narration,
        characterCount: exactCharCount,
        targetCharacterCount: targetCharCount,
        matchPercentage,
        imagePrompt: scene.imagePrompt || `Cinematic historical portrait, 8k, photorealistic, DSLR, 35mm lens --ar 16:9`,
        videoPrompt: scene.videoPrompt || `Slow camera pan, subtle atmospheric movement`,
        audioDesign: scene.audioDesign || `Nhạc nền sử thi phương Đông`,
        pacingNote: scene.pacingNote || `Chuẩn nhịp phát thanh viên 13 cps`,
        storyBeats: scene.storyBeats || [],
      };
    });
  };

  return {
    ...project,
    act1: { ...project.act1, scenes: enrichList(project.act1?.scenes || [], [1, 2, 3]) },
    act2: { ...project.act2, scenes: enrichList(project.act2?.scenes || [], [4, 5, 6]) },
    act3: { ...project.act3, scenes: enrichList(project.act3?.scenes || [], [7, 8, 9]) },
    act4: { ...project.act4, scenes: enrichList(project.act4?.scenes || [], [10, 11, 12]) },
  };
}

// 1. JSON Parser
function parseJsonProject(rawText: string, fileName: string): ImportResult {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/i, '');
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '');
  if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\s*```$/, '');

  const data = JSON.parse(cleaned);
  const root = data.project || data.scriptProject || data.data || data;

  const characterName = root.profile?.characterName || root.characterName || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const title = root.title || `${characterName} - Kịch Bản Sử Ký 6 Phần`;

  const project: MasterScriptProject = {
    id: root.id || `imported-${Date.now()}`,
    title,
    createdAt: root.createdAt || new Date().toISOString().split('T')[0],
    profile: {
      characterName,
      otherNames: root.profile?.otherNames || '',
      era: root.profile?.era || 'Lịch sử phương Đông',
      historicalRole: root.profile?.historicalRole || 'Vĩ nhân lịch sử',
      coreArchetype: root.profile?.coreArchetype || 'Bậc đại trí vĩ đại',
      lifePhilosophy: root.profile?.lifePhilosophy || 'Vì non sông xã tắc',
      innerConflict: root.profile?.innerConflict || 'Mâu thuẫn giữa lý tưởng và thời cuộc',
      fatalFlawOrHubris: root.profile?.fatalFlawOrHubris || 'Sự cô độc của bậc vĩ nhân',
      heroicTragicRatio: root.profile?.heroicTragicRatio || { heroicPercent: 60, tragicPercent: 40 },
      targetDurationMinutes: Number(root.profile?.targetDurationMinutes) || 34,
      visualStyle: root.profile?.visualStyle || 'Điện ảnh phương Đông sắc nét, màu sắc trầm hùng',
      directorSixPartAnalysis: root.profile?.directorSixPartAnalysis || root.directorSixPartAnalysis,
    },
    act1: root.act1 || {
      actTitle: 'Hồi 1: Lưỡi câu và Nguồn cội',
      actDuration: 'Khoảng 3 - 5 phút (Dài nhất 5 phút)',
      hook: { openingStatement: '', voiceoverTone: '', hookVisualPrompt: '' },
      originAndCore: { familyAndSocialContext: '', definingYouthEvent: '', corePhilosophy: '' },
      goldenDialogue1: { characters: '', setting: '', dialogueText: '', dramaticSignificance: '' },
      scenes: [],
    },
    act2: root.act2 || {
      actTitle: 'Hồi 2: Chớp thời cơ và Chinh phục',
      actDuration: 'Khoảng 10 - 12 phút (Dài nhất 12 phút)',
      painPointAndCrisis: '',
      distinctStrategy: '',
      hardshipJourney: '',
      climax1: '',
      scenes: [],
    },
    act3: root.act3 || {
      actTitle: 'Hồi 3: Đỉnh cao quyền lực và Mầm mống tai họa',
      actDuration: 'Khoảng 8 - 10 phút (Dài nhất 10 phút)',
      goldenAge: '',
      seedsOfDoom: '',
      goldenDialogue2: { characters: '', setting: '', dialogueText: '', dramaticSignificance: '' },
      scenes: [],
    },
    act4: root.act4 || {
      actTitle: 'Hồi 4: Cú ngã ngựa và Di sản thiên thu',
      actDuration: 'Khoảng 5 - 7 phút (Dài nhất 7 phút)',
      cataclysmicEvent: '',
      tragicEnd: '',
      redemptionAndLegacy: '',
      closingReflection: '',
      scenes: [],
    },
    production: root.production?.youtubeMetadata
      ? root.production
      : createDefaultProductionPackage(characterName, title),
  };

  const enriched = validateAndEnrichAllScenes(project);
  const allScenes = [
    ...enriched.act1.scenes,
    ...enriched.act2.scenes,
    ...enriched.act3.scenes,
    ...enriched.act4.scenes,
  ];
  const totalChars = allScenes.reduce((acc, s) => acc + (s.characterCount || 0), 0);

  return {
    project: enriched,
    summary: {
      fileName,
      fileSize: rawText.length,
      formatDetected: 'json',
      characterName,
      totalScenesMapped: allScenes.filter((s) => (s.narration || '').length > 0).length || 12,
      totalCharactersNarration: totalChars,
      actsMapped: 4,
      notes: [
        'Định dạng JSON cấu trúc chuẩn Master Script Framework.',
        'Đã tự động liên kết 6 Phần chính và 12 Phân cảnh đầy đủ các trường dữ liệu.',
        'Đã đồng bộ bộ đếm ký tự và thời lượng phát thanh viên chuẩn 13 ký tự/giây.',
      ],
    },
  };
}

// 2. Markdown Parser
function parseMarkdownProject(rawText: string, fileName: string): ImportResult {
  const lines = rawText.split('\n');

  // Extract Title (# ...)
  let title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const titleMatch = rawText.match(/^#\s+(.+)$/m);
  if (titleMatch) title = titleMatch[1].trim();

  // Extract Profile fields
  const extractField = (pattern: RegExp): string => {
    const match = rawText.match(pattern);
    return match ? match[1].trim() : '';
  };

  const characterName =
    extractField(/-\s+\*\*Nhân vật:\*\*\s+([^(\n]+)/i) ||
    extractField(/Nhân vật:\s+([^(\n]+)/i) ||
    title.split('-')[0].trim() ||
    'Vĩ nhân lịch sử';

  const otherNames = extractField(/-\s+\*\*Nhân vật:\*\*\s+[^(]+\(([^)]+)\)/i);
  const era = extractField(/-\s+\*\*Thời đại\s*\/\s*Bối cảnh:\*\*\s+(.+)/i) || 'Lịch sử Việt Nam';
  const historicalRole = extractField(/-\s+\*\*Vị trí lịch sử:\*\*\s+(.+)/i) || 'Khai quốc danh thần';
  const coreArchetype = extractField(/-\s+\*\*Hình mẫu cốt lõi[^:]*:\*\*\s+(.+)/i) || 'Bậc đại trí vĩ nhân';
  const lifePhilosophy = extractField(/-\s+\*\*Triết lý sống:\*\*\s+(.+)/i) || 'Việc nhân nghĩa cốt ở yên dân';
  const innerConflict = extractField(/-\s+\*\*Mâu thuẫn nội tâm:\*\*\s+(.+)/i) || '';
  const fatalFlawOrHubris = extractField(/-\s+\*\*Tử huyệt định mệnh[^:]*:\*\*\s+(.+)/i) || '';
  const visualStyle = extractField(/-\s+\*\*Phong cách điện ảnh:\*\*\s+(.+)/i) || 'Tone trầm mặc điện ảnh';

  // Duration & Heroic/Tragic Ratio
  let targetDurationMinutes = 34;
  const durMatch = rawText.match(/Thời lượng mục tiêu:\s*(\d+)\s*phút/i);
  if (durMatch) targetDurationMinutes = Number(durMatch[1]);

  let heroicPercent = 60;
  let tragicPercent = 40;
  const ratioMatch = rawText.match(/(\d+)%\s*Hào Hùng\s*-\s*(\d+)%\s*Bi Kịch/i);
  if (ratioMatch) {
    heroicPercent = Number(ratioMatch[1]);
    tragicPercent = Number(ratioMatch[2]);
  }

  // Parse Scenes across the document
  const sceneRegex = /#{3,5}\s+Phân cảnh\s+(\d+)[:\s]+([^[\n]+)(?:\[([^\]]+)\])?([\s\S]*?)(?=#{3,5}\s+Phân cảnh|\n##|\n###|\s*$)/gi;
  const parsedScenesMap = new Map<number, Partial<CinematicScene>>();

  let sMatch: RegExpExecArray | null;
  while ((sMatch = sceneRegex.exec(rawText)) !== null) {
    const sNum = Number(sMatch[1]);
    const sTitle = sMatch[2].trim();
    const sTimestamp = sMatch[3] ? sMatch[3].trim() : undefined;
    const body = sMatch[4] || '';

    const narration = (
      body.match(/-\s+\*\*Lời bình Voiceover:\*\*\s+([\s\S]*?)(?=-\s+\*\*|$)/i)?.[1] ||
      body.match(/-\s+\*\*Lời bình:\*\*\s+([\s\S]*?)(?=-\s+\*\*|$)/i)?.[1] ||
      ''
    ).trim();

    const transitionNote = (
      body.match(/-\s+\*\*Ghi chú nối mạch[^:]*:\*\*\s+\*?([^*\n]+)\*?/i)?.[1] || ''
    ).trim();

    const imagePrompt = (
      body.match(/-\s+\*\*Image Prompt[^:]*:\*\*\s+`?([^`\n]+)`?/i)?.[1] || ''
    ).trim();

    const videoPrompt = (
      body.match(/-\s+\*\*Video Prompt[^:]*:\*\*\s+`?([^`\n]+)`?/i)?.[1] || ''
    ).trim();

    const audioDesign = (
      body.match(/-\s+\*\*Âm thanh[^:]*:\*\*\s+([^\n]+)/i)?.[1] || ''
    ).trim();

    const pacingNote = (
      body.match(/-\s+\*\*Gợi ý nhịp dựng:\*\*\s+([^\n]+)/i)?.[1] || ''
    ).trim();

    parsedScenesMap.set(sNum, {
      sceneNumber: sNum,
      title: sTitle,
      timestamp: sTimestamp,
      narration,
      transitionNote,
      imagePrompt,
      videoPrompt,
      audioDesign,
      pacingNote,
    });
  }

  // Helper to extract Act scenes
  const buildActScenes = (sceneNums: number[]): CinematicScene[] => {
    return sceneNums.map((num) => {
      const parsed = parsedScenesMap.get(num) || {};
      const alloc = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === num);
      const defaultS = createDefaultScene(num);

      return {
        ...defaultS,
        ...parsed,
        sceneNumber: num,
        title: parsed.title || defaultS.title,
        timestamp: parsed.timestamp || alloc?.timestamp || defaultS.timestamp,
        narration: parsed.narration || '',
        imagePrompt: parsed.imagePrompt || defaultS.imagePrompt,
        videoPrompt: parsed.videoPrompt || defaultS.videoPrompt,
        audioDesign: parsed.audioDesign || defaultS.audioDesign,
        pacingNote: parsed.pacingNote || defaultS.pacingNote,
      };
    });
  };

  // Extract Golden Dialogues & Hooks
  const hookOpening = extractField(/#### 1\. Lưỡi câu mở đầu[^>]*>\s*\*\*"?([^"*\n]+)"?\*\*/i);
  const hookTone = extractField(/-\s+\*\*Tông giọng Voiceover:\*\*\s+([^\n]+)/i);
  const hookVisual = extractField(/-\s+\*\*Prompt thị giác:\*\*\s+`?([^`\n]+)`?/i);

  const d1Char = extractField(/#### 3\. Cảnh thoại đắt giá 1[\s\S]*?-\s+\*\*Nhân vật:\*\*\s+([^\n]+)/i);
  const d1Setting = extractField(/#### 3\. Cảnh thoại đắt giá 1[\s\S]*?-\s+\*\*Bối cảnh:\*\*\s+([^\n]+)/i);
  const d1Text = extractField(/#### 3\. Cảnh thoại đắt giá 1[\s\S]*?-\s+\*\*Lời thoại:\*\*\s+\*?"?([^"*\n]+)"?\*?/i);
  const d1Sig = extractField(/#### 3\. Cảnh thoại đắt giá 1[\s\S]*?-\s+\*\*Ý nghĩa kịch tính:\*\*\s+([^\n]+)/i);

  const act1: Act1Data = {
    actTitle: extractField(/###\s+(Hồi 1:[^\n]+)/i) || 'Hồi 1: Lưỡi câu và Nguồn cội (Dài nhất 5 phút)',
    actDuration: 'Khoảng 3 - 5 phút (Dài nhất 5 phút)',
    hook: {
      openingStatement: hookOpening || 'Một bản án oan khiên xé nát lịch sử...',
      voiceoverTone: hookTone || 'Thâm trầm, trang trọng, dự báo điềm gở',
      hookVisualPrompt: hookVisual || 'Cinematic opening hook, photorealistic, 8k --ar 16:9',
    },
    originAndCore: {
      familyAndSocialContext: extractField(/-\s+\*\*Bối cảnh gia đình & xã hội:\*\*\s+(.+)/i),
      definingYouthEvent: extractField(/-\s+\*\*Sự kiện niên thiếu định hình:\*\*\s+(.+)/i),
      corePhilosophy: extractField(/-\s+\*\*Triết lý cốt lõi:\*\*\s+(.+)/i),
    },
    goldenDialogue1: {
      characters: d1Char || `${characterName} & Thân phụ`,
      setting: d1Setting || 'Ải Nam Quan',
      dialogueText: d1Text || 'Quay về rửa nhục cho nước, trả thù cho cha, đó mới là đại hiếu!',
      dramaticSignificance: d1Sig || 'Đập tan sự ủy mị, đưa nhân vật vào con đường phục quốc.',
    },
    scenes: buildActScenes([1, 2, 3]),
    actTransitionCliffhanger: extractField(/Câu chốt Hồi 1[^:]*:\s*(.+)/i),
  };

  const act2: Act2Data = {
    actTitle: extractField(/###\s+(Hồi 2:[^\n]+)/i) || 'Hồi 2: Chớp thời cơ và Chinh phục (Dài nhất 12 phút)',
    actDuration: 'Khoảng 10 - 12 phút (Dài nhất 12 phút)',
    painPointAndCrisis: extractField(/-\s+\*\*Khủng hoảng & Bế tắc:\*\*\s+(.+)/i),
    distinctStrategy: extractField(/-\s+\*\*Chiến lược đột phá:\*\*\s+(.+)/i),
    hardshipJourney: extractField(/-\s+\*\*Hành trình vượt khó:\*\*\s+(.+)/i),
    climax1: extractField(/-\s+\*\*Cao trào 1:\*\*\s+(.+)/i),
    scenes: buildActScenes([4, 5, 6]),
    actTransitionCliffhanger: extractField(/Câu chốt Hồi 2[^:]*:\s*(.+)/i),
  };

  const act3: Act3Data = {
    actTitle: extractField(/###\s+(Hồi 3:[^\n]+)/i) || 'Hồi 3: Đỉnh cao quyền lực và Mầm mống tai họa (Dài nhất 10 phút)',
    actDuration: 'Khoảng 8 - 10 phút (Dài nhất 10 phút)',
    goldenAge: extractField(/-\s+\*\*Đỉnh cao danh vọng:\*\*\s+(.+)/i),
    seedsOfDoom: extractField(/-\s+\*\*Mầm mống tai họa:\*\*\s+(.+)/i),
    goldenDialogue2: {
      characters: extractField(/Cảnh thoại đắt giá 2[\s\S]*?-\s+\*\*Nhân vật:\*\*\s+([^\n]+)/i),
      setting: extractField(/Cảnh thoại đắt giá 2[\s\S]*?-\s+\*\*Bối cảnh:\*\*\s+([^\n]+)/i),
      dialogueText: extractField(/Cảnh thoại đắt giá 2[\s\S]*?-\s+\*\*Lời thoại:\*\*\s+\*?"?([^"*\n]+)"?\*?/i),
      dramaticSignificance: extractField(/Cảnh thoại đắt giá 2[\s\S]*?-\s+\*\*Ý nghĩa kịch tính:\*\*\s+([^\n]+)/i),
    },
    scenes: buildActScenes([7, 8, 9]),
    actTransitionCliffhanger: extractField(/Câu chốt Hồi 3[^:]*:\s*(.+)/i),
  };

  const act4: Act4Data = {
    actTitle: extractField(/###\s+(Hồi 4:[^\n]+)/i) || 'Hồi 4: Cú ngã ngựa và Di sản thiên thu (Dài nhất 7 phút)',
    actDuration: 'Khoảng 5 - 7 phút (Dài nhất 7 phút)',
    cataclysmicEvent: extractField(/-\s+\*\*Biến cố chấn động:\*\*\s+(.+)/i),
    tragicEnd: extractField(/-\s+\*\*Kết cục bi tráng:\*\*\s+(.+)/i),
    redemptionAndLegacy: extractField(/-\s+\*\*Chiêu tuyết & Di sản:\*\*\s+(.+)/i),
    closingReflection: extractField(/-\s+\*\*Lời bình kết thúc:\*\*\s+(.+)/i),
    scenes: buildActScenes([10, 11, 12]),
  };

  const project: MasterScriptProject = {
    id: `imported-md-${Date.now()}`,
    title,
    createdAt: new Date().toISOString().split('T')[0],
    profile: {
      characterName,
      otherNames,
      era,
      historicalRole,
      coreArchetype,
      lifePhilosophy,
      innerConflict,
      fatalFlawOrHubris,
      heroicTragicRatio: { heroicPercent, tragicPercent },
      targetDurationMinutes,
      visualStyle,
    },
    act1,
    act2,
    act3,
    act4,
    production: createDefaultProductionPackage(
      characterName,
      title,
      extractField(/#### Mô tả video YouTube \(Template\):\n```\n([\s\S]*?)\n```/i)
    ),
  };

  const enriched = validateAndEnrichAllScenes(project);
  const allScenes = [
    ...enriched.act1.scenes,
    ...enriched.act2.scenes,
    ...enriched.act3.scenes,
    ...enriched.act4.scenes,
  ];
  const totalChars = allScenes.reduce((acc, s) => acc + (s.characterCount || 0), 0);

  return {
    project: enriched,
    summary: {
      fileName,
      fileSize: rawText.length,
      formatDetected: 'markdown',
      characterName,
      totalScenesMapped: parsedScenesMap.size || 12,
      totalCharactersNarration: totalChars,
      actsMapped: 4,
      notes: [
        'Định dạng Markdown kịch bản phân cảnh chi tiết.',
        `Đã bóc tách thành công ${parsedScenesMap.size} phân cảnh trực tiếp từ tệp văn bản.`,
        'Các trường Hồ sơ Nhân vật và Bộ công cụ YouTube đã được tự động ánh xạ.',
      ],
    },
  };
}

// 3. Raw Text / Script Fallback Parser
function parsePlainTextProject(rawText: string, fileName: string): ImportResult {
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const paragraphs = rawText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  // Group paragraphs into 12 chunks for 12 scenes
  const scenesChunks: string[] = [];
  if (paragraphs.length >= 12) {
    const chunkSize = Math.ceil(paragraphs.length / 12);
    for (let i = 0; i < 12; i++) {
      scenesChunks.push(paragraphs.slice(i * chunkSize, (i + 1) * chunkSize).join('\n\n'));
    }
  } else {
    // Distribute available paragraphs
    for (let i = 0; i < 12; i++) {
      scenesChunks.push(paragraphs[i] || '');
    }
  }

  const buildScenes = (nums: number[]): CinematicScene[] => {
    return nums.map((num) => {
      const defaultS = createDefaultScene(num);
      const text = scenesChunks[num - 1] || '';
      return {
        ...defaultS,
        narration: text,
      };
    });
  };

  const project: MasterScriptProject = {
    id: `imported-txt-${Date.now()}`,
    title: `${cleanName} - Kịch Bản 6 Phần Chính`,
    createdAt: new Date().toISOString().split('T')[0],
    profile: {
      characterName: cleanName,
      otherNames: '',
      era: 'Lịch sử phương Đông',
      historicalRole: 'Nhân vật lịch sử',
      coreArchetype: 'Bậc đại trí vĩ đại',
      lifePhilosophy: 'Vì đại nghĩa quốc gia',
      innerConflict: 'Mâu thuẫn giữa lý tưởng và hiện thực',
      fatalFlawOrHubris: '',
      heroicTragicRatio: { heroicPercent: 55, tragicPercent: 45 },
      targetDurationMinutes: 34,
      visualStyle: 'Ánh sáng điện ảnh phương Đông, tone trầm mặc',
    },
    act1: {
      actTitle: 'Hồi 1: Lưỡi câu và Nguồn cội (Dài nhất 5 phút)',
      actDuration: 'Khoảng 3 - 5 phút (Dài nhất 5 phút)',
      hook: { openingStatement: scenesChunks[0]?.slice(0, 150) || '', voiceoverTone: 'Trầm ấm', hookVisualPrompt: '' },
      originAndCore: { familyAndSocialContext: '', definingYouthEvent: '', corePhilosophy: '' },
      goldenDialogue1: { characters: '', setting: '', dialogueText: '', dramaticSignificance: '' },
      scenes: buildScenes([1, 2, 3]),
    },
    act2: {
      actTitle: 'Hồi 2: Chớp thời cơ và Chinh phục (Dài nhất 12 phút)',
      actDuration: 'Khoảng 10 - 12 phút (Dài nhất 12 phút)',
      painPointAndCrisis: '',
      distinctStrategy: '',
      hardshipJourney: '',
      climax1: '',
      scenes: buildScenes([4, 5, 6]),
    },
    act3: {
      actTitle: 'Hồi 3: Đỉnh cao quyền lực và Mầm mống tai họa (Dài nhất 10 phút)',
      actDuration: 'Khoảng 8 - 10 phút (Dài nhất 10 phút)',
      goldenAge: '',
      seedsOfDoom: '',
      goldenDialogue2: { characters: '', setting: '', dialogueText: '', dramaticSignificance: '' },
      scenes: buildScenes([7, 8, 9]),
    },
    act4: {
      actTitle: 'Hồi 4: Cú ngã ngựa và Di sản thiên thu (Dài nhất 7 phút)',
      actDuration: 'Khoảng 5 - 7 phút (Dài nhất 7 phút)',
      cataclysmicEvent: '',
      tragicEnd: '',
      redemptionAndLegacy: '',
      closingReflection: scenesChunks[11]?.slice(0, 200) || '',
      scenes: buildScenes([10, 11, 12]),
    },
    production: createDefaultProductionPackage(cleanName, `${cleanName} - Kịch Bản 6 Phần Chính`),
  };

  const enriched = validateAndEnrichAllScenes(project);
  const totalChars = [
    ...enriched.act1.scenes,
    ...enriched.act2.scenes,
    ...enriched.act3.scenes,
    ...enriched.act4.scenes,
  ].reduce((acc, s) => acc + (s.characterCount || 0), 0);

  return {
    project: enriched,
    summary: {
      fileName,
      fileSize: rawText.length,
      formatDetected: 'text',
      characterName: cleanName,
      totalScenesMapped: 12,
      totalCharactersNarration: totalChars,
      actsMapped: 4,
      notes: [
        'Định dạng Văn bản thuần (Plain Text).',
        'Nội dung đã được phân đoạn tự động vào 12 phân cảnh chuẩn 6 Phần chính.',
        'Bạn có thể tiếp tục tinh chỉnh hoặc dùng AI Auto-Fit để cân chỉnh chính xác thời lượng.',
      ],
    },
  };
}

// Master Entry Point for Importing Any File
export function parseImportedFile(rawText: string, fileName: string): ImportResult {
  const trimmed = rawText.trim();
  const lowerName = fileName.toLowerCase();

  // Try JSON first if extension is .json or starts with { or [
  if (lowerName.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return parseJsonProject(trimmed, fileName);
    } catch (e) {
      console.warn('JSON parse attempt failed, falling back to Markdown/Text:', e);
    }
  }

  // Try Markdown if .md or contains typical markdown headers
  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown') || trimmed.startsWith('#') || trimmed.includes('## ') || trimmed.includes('### ')) {
    return parseMarkdownProject(trimmed, fileName);
  }

  // Fallback to text
  return parsePlainTextProject(trimmed, fileName);
}
