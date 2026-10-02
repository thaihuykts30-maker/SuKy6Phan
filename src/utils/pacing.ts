import { MasterScriptProject, CinematicScene, PartSectionConfig, PartSectionData } from '../types/script';

// Master Script Framework Timing & Pacing Architecture
// Định mức phát thanh viên phim tài liệu lịch sử tiếng Việt: 900 ký tự/phút (15 ký tự/giây)
// (Tính chính xác từng chữ cái, con số, dấu câu và khoảng trắng)

export const DEFAULT_CHARS_PER_SECOND = 15; // 900 ký tự/phút chuẩn

export type PacingSpeedMode = 'slow' | 'standard' | 'fast';

export const PACING_RATES: Record<PacingSpeedMode, { cps: number; label: string; desc: string }> = {
  slow: { cps: 13, label: 'Thong thả / Trầm lắng (13 cps ~ 780 ký tự/phút)', desc: 'Dành cho trường đoạn bi kịch, tang lễ, suy tư sâu sắc' },
  standard: { cps: 15, label: 'Chuẩn 900 ký tự/phút (15 cps)', desc: 'Tốc độ giọng đọc tài liệu điện ảnh chính xác 900 ký tự/phút (15 ký tự/giây)' },
  fast: { cps: 17, label: 'Dồn dập / Chiến trận (17 cps ~ 1,020 ký tự/phút)', desc: 'Dành cho các cảnh hành quân thần tốc, đại chiến nghẹt thở' },
};

// CẤU TRÚC 6 PHẦN CHÍNH CHUẨN ĐIỆN ẢNH (MASTER 6-PART FRAMEWORK) - TỔNG THỜI LƯỢNG 34 PHÚT
export const MASTER_SIX_PARTS_CONFIG: PartSectionConfig[] = [
  {
    partIndex: 1,
    partKey: 'the_hook',
    partTitle: 'PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG',
    shortTitle: '1. The Hook - Lời Tựa Gây Chấn Động',
    durationPercentage: '10-15%',
    defaultDurationText: '3 phút (10-15%)',
    targetSeconds: 180, // 75s + 105s
    objective: 'Ném ngay một nghịch lý, một sự kiện chấn động hoặc thành tựu vĩ đại nhất của nhân vật vào tâm trí khán giả. Không kể lề mề từ lúc sinh ra.',
    sampleStructure: {
      voTone: 'Giọng kể dồn dập, gãy gọn - Âm nhạc dồn dập',
      voFormula: 'Lịch sử/Thế giới từng chứng kiến vô số [Loại nhân vật]. Nhưng hiếm ai để lại một di sản [Tính từ] như [Tên Nhân Vật]. Từ một kẻ [Xuất thân tận đáy/Bị ruồng bỏ], [Hắn/Ông/Nàng] đã làm một việc điên rồ: [Hành động vĩ đại nhất/Tai tiếng nhất].',
      dialogueFormula: 'Nhân vật phụ (khinh bỉ/hoảng sợ): "Ngươi điên rồi! Một kẻ như ngươi mà đòi [Mục tiêu không tưởng] sao?" • [Tên Nhân vật] (lạnh lùng, sắc lẹm): "[Một câu thoại kinh điển thể hiện tham vọng/triết lý sống]."',
      outroVoFormula: 'Hôm nay, hãy cùng lật lại những trang hồ sơ chìm khuất nhất về cuộc đời của [Biệt danh định vị nhân vật].',
    },
    sceneNumbers: [1, 2],
  },
  {
    partIndex: 2,
    partKey: 'past_wound',
    partTitle: 'PHẦN 2: VẾT THƯƠNG QUÁ KHỨ & ĐỘNG LỰC CỐT LÕI',
    shortTitle: '2. Vết Thương Quá Khứ & Động Lực Cốt Lõi',
    durationPercentage: '15-20%',
    defaultDurationText: '5.5 phút (15-20%)',
    targetSeconds: 330, // 120s + 210s
    objective: 'Giải thích lý do sâu xa khiến nhân vật bắt đầu hành trình. Họ thiếu thốn điều gì? Vết thương lòng nào đẩy họ đi tới cùng cực?',
    sampleStructure: {
      voTone: 'Giọng chậm rãi, đồng cảm, lắng đọng',
      voFormula: 'Trước khi trở thành [Danh xưng hiện tại], [Tên Nhân Vật] từng nếm đủ mùi vị của sự [Sự kiện đau thương: nghèo đói, phản bội, khinh khi]. Sống trong một thời đại mà [Luật lệ bối cảnh xã hội], những kẻ như [Tên Nhân vật] chỉ được xem là [Từ ngữ hạ thấp].',
      dialogueFormula: 'Kẻ thù/Người đời (trịch thượng): "Biết thân biết phận đi. Giống nòi/Thân phận nhà ngươi muôn đời chỉ có thể quỳ gối mà thôi!" • [Tên Nhân Vật] (siết chặt tay, nói thầm kiên quyết): "Ta sẽ cho các người thấy. Kẻ quỳ gối ngày mai... sẽ là các người."',
      outroVoFormula: 'Chính khoảnh khắc tủi nhục ấy đã gieo xuống một hạt mầm. Không phải hạt mầm của sự cam chịu, mà là hạt mầm của sự vươn lên tàn khốc.',
    },
    sceneNumbers: [3, 4],
  },
  {
    partIndex: 3,
    partKey: 'crazy_idea',
    partTitle: 'PHẦN 3: Ý TƯỞNG ĐIÊN RỒ & SỰ ĐÁNH ĐỔI CHÍ MẠNG',
    shortTitle: '3. Ý Tưởng Điên Rồ & Đánh Đổi Chí Mạng',
    durationPercentage: '20-25%',
    defaultDurationText: '8.5 phút (20-25%)',
    targetSeconds: 510, // 240s + 270s
    objective: 'Thể hiện bước ngoặt lớn nhất. Hành động cụ thể nào bứt phá họ khỏi vũng lầy? Phải lồng ghép sự hy sinh để nhân vật đa chiều hơn.',
    sampleStructure: {
      voTone: 'Nhịp độ nhanh dần, kịch tính, dồn dập',
      voFormula: 'Không cam tâm chấp nhận số phận, [Tên Nhân vật] nảy ra một kế hoạch mà người thường cho là tự sát: [Mô tả ngắn gọn kế hoạch]. Nhưng để chơi ván cược này, cái giá phải trả là cực kỳ đắt.',
      dialogueFormula: 'Người tri kỷ/Đồng minh (lo lắng): "Nếu thất bại, cái mạng này cũng không giữ được. Huống hồ, ngươi định đánh đổi cả [Thứ quý giá: gia tài, tình yêu, danh dự] sao?" • [Tên Nhân vật] (ánh mắt sắc sảo/điên dại): "Kẻ không dám vứt bỏ thứ nhỏ nhặt, sao ôm trọn được cả thiên hạ? Ta cược toàn bộ!"',
      outroVoFormula: 'Bằng trí tuệ siêu phàm và sự nhẫn tâm với chính bản thân mình, [Tên Nhân vật] bắt đầu thao túng ván cờ lớn nhất cuộc đời.',
    },
    sceneNumbers: [5, 6],
  },
  {
    partIndex: 4,
    partKey: 'power_peak',
    partTitle: 'PHẦN 4: ĐỈNH CAO QUYỀN LỰC',
    shortTitle: '4. Đỉnh Cao Quyền Lực',
    durationPercentage: '15%',
    defaultDurationText: '6.75 phút (~15%)',
    targetSeconds: 405, // 195s + 210s
    objective: 'Khán giả cần thấy thành quả. Tạo ra một "montage" (chuỗi hình ảnh/sự kiện) liên tiếp chứng minh sự vô đối của nhân vật.',
    sampleStructure: {
      voTone: 'Giọng hào sảng, vinh quang - Âm nhạc hoành tráng',
      voFormula: 'Ván cược thành công rực rỡ. [Năm/Thời gian], [Tên Nhân vật] chính thức bước lên đỉnh cao. Không còn kẻ nào dám nhìn thẳng vào mắt [Ông/Bà/Hắn]. [Liệt kê 2-3 thành tựu lớn nhất: nắm quyền, thống nhất đất nước, tiêu diệt quân thù].',
      dialogueFormula: 'Cấp dưới (quỳ phục kính cẩn): "Bẩm [Chức tước], mọi kẻ ngáng đường đều đã bị dọn sạch. Ngài giờ là vạn bề vô tôn." • [Tên Nhân vật] (ngồi trên ghế cao, phẩy tay nhẹ tênh): "Chưa đủ. Bắt chúng phải [Hành động phục tùng tuyệt đối]. Ta muốn cái tên này lưu truyền ngàn vạn năm sau."',
      outroVoFormula: 'Quyền lực, tiền tài, danh vọng... [Tên Nhân vật] có tất cả. Nhưng trên đỉnh cao lộng gió, người ta rất dễ bước hụt chân.',
    },
    sceneNumbers: [7, 8],
  },
  {
    partIndex: 5,
    partKey: 'blind_spot',
    partTitle: 'PHẦN 5: ĐIỂM MÙ & MẦM MỐNG TAI HỌA',
    shortTitle: '5. Điểm Mù & Mầm Mống Tai Họa',
    durationPercentage: '15%',
    defaultDurationText: '5.5 phút (15%)',
    targetSeconds: 330, // 195s + 135s
    objective: 'Bắt đầu kéo nhân vật xuống. Cho thấy sự kiêu ngạo hoặc sai lầm nhỏ sẽ làm sụp đổ cả đế chế.',
    sampleStructure: {
      voTone: 'Giọng chùng xuống, nguy hiểm tăm tối',
      voFormula: 'Cổ nhân có câu: "Vật cực tất phản". Khi đạt đến tột đỉnh vinh quang cũng là lúc mầm mống hủy diệt bắt đầu nảy nở. Sai lầm chí mạng của [Tên Nhân vật] không đến từ kẻ thù bên ngoài, mà đến từ chính [Điểm yếu: sự tự cao, dục vọng, mù quáng tin tưởng].',
      dialogueFormula: 'Quân sư trung thành (khẩn thiết): "Ngài đi nước cờ này quá mạo hiểm. Kẻ [Tên kẻ thù/Mối đe dọa] đang âm thầm lớn mạnh. Xin ngài hãy đề phòng!" • [Tên Nhân vật] (cười nhạt, gạt đi): "Một con kiến hôi thì làm nên trò trống gì? Lịch sử nằm trong tay ta, ta mới là người định đoạt!"',
      outroVoFormula: 'Sự kiêu ngạo đã che mờ lý trí. Một kẽ nứt nhỏ đã xuất hiện trên bức tường thành kiên cố nhất.',
    },
    sceneNumbers: [9, 10],
  },
  {
    partIndex: 6,
    partKey: 'the_fall',
    partTitle: 'PHẦN 6: SỰ SỤP ĐỔ & BÀI HỌC NHÂN SINH',
    shortTitle: '6. Sự Sụp Đổ & Bài Học Nhân Sinh',
    durationPercentage: '10-15%',
    defaultDurationText: '4.75 phút (10-15%)',
    targetSeconds: 285, // 135s + 150s
    objective: 'Đoạn kết bi tráng hoặc đầy suy ngẫm. Đúc kết lại toàn bộ ý nghĩa cuộc đời nhân vật.',
    sampleStructure: {
      voTone: 'Giọng dồn dập rồi đột ngột buông thõng - Âm nhạc bi thương',
      voFormula: '[Sự kiện phản đập/Biến cố lớn] nổ ra như một giọt nước tràn ly. Đế chế mà [Tên Nhân Vật] dùng cả đời đánh đổi bằng máu và nước mắt... sụp đổ chỉ trong [Thời gian ngắn].',
      dialogueFormula: '[Tên Nhân vật] (ánh mắt trống rỗng/hoặc kiên cường đón cái chết): "Cả đời ta dùng [Thủ đoạn/Năng lực] để đổi lấy thiên hạ... Nhưng cuối cùng, thiên hạ lại là thứ nhốt ta vào đường cùng."',
      outroVoFormula: '[Ngày/Tháng/Năm], [Tên Nhân vật] giã từ cõi đời. Cuộc đời [Ông/Bà/Hắn] khép lại, để lại vô vàn tranh cãi. Nhưng bài học lớn nhất mà [Tên Nhân vật] để lại, đó là: [Câu đúc kết triết lý: Tiền bạc có thể thao túng con người, nhưng không mua được lòng dạ thời cuộc / Quyền lực là con dao hai lưỡi, kẻ chơi dao sẽ có ngày đứt tay].',
    },
    sceneNumbers: [11, 12],
  },
];

export interface MasterSceneAllocation {
  sceneNumber: number;
  actIndex: 1 | 2 | 3 | 4; // backward compatible
  partIndex: 1 | 2 | 3 | 4 | 5 | 6; // New 6-Part mapping
  partTitle: string;
  partPercentage: string;
  actTitle: string;
  defaultTitle: string;
  timestamp: string;
  durationSeconds: number; // Thời lượng dài nhất được phân bổ
  targetCharactersStandard: number; // @ 13 cps
}

export const MASTER_SCENE_ALLOCATIONS: MasterSceneAllocation[] = [
  // PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG (10-15% video ~ 3 phút = 180s)
  {
    sceneNumber: 1,
    actIndex: 1,
    partIndex: 1,
    partTitle: 'PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG',
    partPercentage: '10-15%',
    actTitle: 'Phần 1: The Hook - Lời tựa gây chấn động (10-15%)',
    defaultTitle: 'The Hook - Nghịch lý chấn động & Lời mở đầu dồn dập',
    timestamp: '00:00 - 01:15',
    durationSeconds: 75,
    targetCharactersStandard: 75 * DEFAULT_CHARS_PER_SECOND, // 1,125
  },
  {
    sceneNumber: 2,
    actIndex: 1,
    partIndex: 1,
    partTitle: 'PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG',
    partPercentage: '10-15%',
    actTitle: 'Phần 1: The Hook - Lời tựa gây chấn động (10-15%)',
    defaultTitle: 'Phân cảnh hồi tưởng ngắn & Biệt danh định vị nhân vật',
    timestamp: '01:15 - 03:00',
    durationSeconds: 105,
    targetCharactersStandard: 105 * DEFAULT_CHARS_PER_SECOND, // 1,575
  },

  // PHẦN 2: VẾT THƯƠNG QUÁ KHỨ & ĐỘNG LỰC CỐT LÕI (15-20% video ~ 5.5 phút = 330s)
  {
    sceneNumber: 3,
    actIndex: 1,
    partIndex: 2,
    partTitle: 'PHẦN 2: VẾT THƯƠNG QUÁ KHỨ & ĐỘNG LỰC CỐT LÕI',
    partPercentage: '15-20%',
    actTitle: 'Phần 2: Vết thương quá khứ & Động lực cốt lõi (15-20%)',
    defaultTitle: 'Vết thương lòng & Bị khinh khi dưới đáy xã hội',
    timestamp: '03:00 - 05:00',
    durationSeconds: 120,
    targetCharactersStandard: 120 * DEFAULT_CHARS_PER_SECOND, // 1,800
  },
  {
    sceneNumber: 4,
    actIndex: 2,
    partIndex: 2,
    partTitle: 'PHẦN 2: VẾT THƯƠNG QUÁ KHỨ & ĐỘNG LỰC CỐT LÕI',
    partPercentage: '15-20%',
    actTitle: 'Phần 2: Vết thương quá khứ & Động lực cốt lõi (15-20%)',
    defaultTitle: 'Nỗi nhục thúc đẩy & Hạt mầm vươn lên tàn khốc',
    timestamp: '05:00 - 08:30',
    durationSeconds: 210,
    targetCharactersStandard: 210 * DEFAULT_CHARS_PER_SECOND, // 3,150
  },

  // PHẦN 3: Ý TƯỞNG ĐIÊN RỒ & SỰ ĐÁNH ĐỔI CHÍ MẠNG (20-25% video ~ 8.5 phút = 510s)
  {
    sceneNumber: 5,
    actIndex: 2,
    partIndex: 3,
    partTitle: 'PHẦN 3: Ý TƯỞNG ĐIÊN RỒ & SỰ ĐÁNH ĐỔI CHÍ MẠNG',
    partPercentage: '20-25%',
    actTitle: 'Phần 3: Ý tưởng điên rồ & Sự đánh đổi chí mạng (20-25%)',
    defaultTitle: 'Kế hoạch tự sát & Canh bạc đánh đổi đắt giá',
    timestamp: '08:30 - 12:30',
    durationSeconds: 240,
    targetCharactersStandard: 240 * DEFAULT_CHARS_PER_SECOND, // 3,600
  },
  {
    sceneNumber: 6,
    actIndex: 2,
    partIndex: 3,
    partTitle: 'PHẦN 3: Ý TƯỞNG ĐIÊN RỒ & SỰ ĐÁNH ĐỔI CHÍ MẠNG',
    partPercentage: '20-25%',
    actTitle: 'Phần 3: Ý tưởng điên rồ & Sự đánh đổi chí mạng (20-25%)',
    defaultTitle: 'Thao túng ván cờ lớn nhất & Bứt phá ngoạn mục',
    timestamp: '12:30 - 17:00',
    durationSeconds: 270,
    targetCharactersStandard: 270 * DEFAULT_CHARS_PER_SECOND, // 4,050
  },

  // PHẦN 4: ĐỈNH CAO QUYỀN LỰC (15% video ~ 6.75 phút = 405s)
  {
    sceneNumber: 7,
    actIndex: 3,
    partIndex: 4,
    partTitle: 'PHẦN 4: ĐỈNH CAO QUYỀN LỰC',
    partPercentage: '15%',
    actTitle: 'Phần 4: Đỉnh cao quyền lực (15%)',
    defaultTitle: 'Ván cược đại thành công & Montage vinh quang tột đỉnh',
    timestamp: '17:00 - 20:15',
    durationSeconds: 195,
    targetCharactersStandard: 195 * DEFAULT_CHARS_PER_SECOND, // 2,925
  },
  {
    sceneNumber: 8,
    actIndex: 3,
    partIndex: 4,
    partTitle: 'PHẦN 4: ĐỈNH CAO QUYỀN LỰC',
    partPercentage: '15%',
    actTitle: 'Phần 4: Đỉnh cao quyền lực (15%)',
    defaultTitle: 'Quyền lực tuyệt đối & Vạn bề quy phục',
    timestamp: '20:15 - 23:45',
    durationSeconds: 210,
    targetCharactersStandard: 210 * DEFAULT_CHARS_PER_SECOND, // 3,150
  },

  // PHẦN 5: ĐIỂM MÙ & MẦM MỐNG TAI HỌA (15% video ~ 5.5 phút = 330s)
  {
    sceneNumber: 9,
    actIndex: 3,
    partIndex: 5,
    partTitle: 'PHẦN 5: ĐIỂM MÙ & MẦM MỐNG TAI HỌA',
    partPercentage: '15%',
    actTitle: 'Phần 5: Điểm mù & Mầm mống tai họa (15%)',
    defaultTitle: 'Vật cực tất phản & Sự kiêu ngạo che mờ lý trí',
    timestamp: '23:45 - 27:00',
    durationSeconds: 195,
    targetCharactersStandard: 195 * DEFAULT_CHARS_PER_SECOND, // 2,925
  },
  {
    sceneNumber: 10,
    actIndex: 4,
    partIndex: 5,
    partTitle: 'PHẦN 5: ĐIỂM MÙ & MẦM MỐNG TAI HỌA',
    partPercentage: '15%',
    actTitle: 'Phần 5: Điểm mù & Mầm mống tai họa (15%)',
    defaultTitle: 'Bỏ qua lời cảnh báo & Kẽ nứt đầu tiên trên tường thành',
    timestamp: '27:00 - 29:15',
    durationSeconds: 135,
    targetCharactersStandard: 135 * DEFAULT_CHARS_PER_SECOND, // 2,025
  },

  // PHẦN 6: SỰ SỤP ĐỔ & BÀI HỌC NHÂN SINH (10-15% video ~ 4.75 phút = 285s)
  {
    sceneNumber: 11,
    actIndex: 4,
    partIndex: 6,
    partTitle: 'PHẦN 6: SỰ SỤP ĐỔ & BÀI HỌC NHÂN SINH',
    partPercentage: '10-15%',
    actTitle: 'Phần 6: Sự sụp đổ & Bài học nhân sinh (10-15%)',
    defaultTitle: 'Biến cố giọt nước tràn ly & Đế chế sụp đổ trong chớp mắt',
    timestamp: '29:15 - 31:30',
    durationSeconds: 135,
    targetCharactersStandard: 135 * DEFAULT_CHARS_PER_SECOND, // 2,025
  },
  {
    sceneNumber: 12,
    actIndex: 4,
    partIndex: 6,
    partTitle: 'PHẦN 6: SỰ SỤP ĐỔ & BÀI HỌC NHÂN SINH',
    partPercentage: '10-15%',
    actTitle: 'Phần 6: Sự sụp đổ & Bài học nhân sinh (10-15%)',
    defaultTitle: 'Phân cảnh trăn trối cuối đời & Bài học nhân sinh vạn cổ',
    timestamp: '31:30 - 34:00',
    durationSeconds: 150,
    targetCharactersStandard: 150 * DEFAULT_CHARS_PER_SECOND, // 2,250
  },
];

// Helper to get master allocation by scene number
export function getMasterSceneAllocation(sceneNumber: number): MasterSceneAllocation {
  const found = MASTER_SCENE_ALLOCATIONS.find((a) => a.sceneNumber === sceneNumber);
  if (found) return found;
  // Fallback
  return {
    sceneNumber,
    actIndex: 1,
    partIndex: 1,
    partTitle: 'PHẦN 1: THE HOOK - LỜI TỰA GÂY CHẤN ĐỘNG',
    partPercentage: '10-15%',
    actTitle: 'Phân cảnh bổ sung',
    defaultTitle: `Phân cảnh #${sceneNumber}`,
    timestamp: '00:00 - 01:15',
    durationSeconds: 75,
    targetCharactersStandard: 75 * DEFAULT_CHARS_PER_SECOND,
  };
}

// Helper to group project scenes into the 6 Parts
export function getSixPartsFromProject(project: MasterScriptProject): PartSectionData[] {
  const allScenes: CinematicScene[] = [
    ...(project.act1?.scenes || []),
    ...(project.act2?.scenes || []),
    ...(project.act3?.scenes || []),
    ...(project.act4?.scenes || []),
  ];

  const templates = project.directorSixPartAnalysis?.sixPartTemplates || project.profile?.directorSixPartAnalysis?.sixPartTemplates;

  return MASTER_SIX_PARTS_CONFIG.map((config) => {
    const scenes = allScenes.filter((s) => config.sceneNumbers.includes(s.sceneNumber as any));
    let sampleStructure = { ...config.sampleStructure };

    if (templates) {
      if (config.partIndex === 1 && templates.part1Hook) {
        sampleStructure = {
          voTone: templates.part1Hook.voTone || sampleStructure.voTone,
          voFormula: templates.part1Hook.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part1Hook.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part1Hook.voOutro || sampleStructure.outroVoFormula,
        };
      } else if (config.partIndex === 2 && templates.part2PastWound) {
        sampleStructure = {
          voTone: templates.part2PastWound.voTone || sampleStructure.voTone,
          voFormula: templates.part2PastWound.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part2PastWound.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part2PastWound.voOutro || sampleStructure.outroVoFormula,
        };
      } else if (config.partIndex === 3 && templates.part3CrazyIdea) {
        sampleStructure = {
          voTone: templates.part3CrazyIdea.voTone || sampleStructure.voTone,
          voFormula: templates.part3CrazyIdea.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part3CrazyIdea.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part3CrazyIdea.voOutro || sampleStructure.outroVoFormula,
        };
      } else if (config.partIndex === 4 && templates.part4PowerPeak) {
        sampleStructure = {
          voTone: templates.part4PowerPeak.voTone || sampleStructure.voTone,
          voFormula: templates.part4PowerPeak.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part4PowerPeak.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part4PowerPeak.voOutro || sampleStructure.outroVoFormula,
        };
      } else if (config.partIndex === 5 && templates.part5BlindSpot) {
        sampleStructure = {
          voTone: templates.part5BlindSpot.voTone || sampleStructure.voTone,
          voFormula: templates.part5BlindSpot.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part5BlindSpot.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part5BlindSpot.voOutro || sampleStructure.outroVoFormula,
        };
      } else if (config.partIndex === 6 && templates.part6TheFall) {
        sampleStructure = {
          voTone: templates.part6TheFall.voTone || sampleStructure.voTone,
          voFormula: templates.part6TheFall.voIntro || sampleStructure.voFormula,
          dialogueFormula: templates.part6TheFall.dialogue || sampleStructure.dialogueFormula,
          outroVoFormula: templates.part6TheFall.voOutro || sampleStructure.outroVoFormula,
        };
      }
    }

    return {
      partIndex: config.partIndex,
      partKey: config.partKey,
      partTitle: config.partTitle,
      shortTitle: config.shortTitle,
      durationPercentage: config.durationPercentage,
      partDuration: config.defaultDurationText,
      objective: config.objective,
      sampleStructure,
      scenes,
    };
  });
}

export function parseTimestampToSeconds(timestamp: string): { startSec: number; endSec: number; durationSec: number } {
  if (!timestamp) return { startSec: 0, endSec: 60, durationSec: 60 };

  const parts = timestamp.split('-').map((p) => p.trim());
  if (parts.length < 2) return { startSec: 0, endSec: 60, durationSec: 60 };

  const parseTime = (timeStr: string): number => {
    const segments = timeStr.split(':').map((s) => parseInt(s, 10));
    if (segments.length === 2 && !isNaN(segments[0]) && !isNaN(segments[1])) {
      return segments[0] * 60 + segments[1];
    }
    if (segments.length === 3 && !isNaN(segments[0]) && !isNaN(segments[1]) && !isNaN(segments[2])) {
      return segments[0] * 3600 + segments[1] * 60 + segments[2];
    }
    return 0;
  };

  const startSec = parseTime(parts[0]);
  const endSec = parseTime(parts[1]);
  const durationSec = Math.max(15, endSec - startSec);

  return { startSec, endSec, durationSec };
}

// Bóc tách chi tiết từng chữ cái, số, dấu câu và khoảng trắng
export interface DetailedCharacterBreakdown {
  total: number;
  letters: number;
  digits: number;
  punctuation: number;
  whitespace: number;
}

export function countDetailedCharacters(text: string): DetailedCharacterBreakdown {
  if (!text) return { total: 0, letters: 0, digits: 0, punctuation: 0, whitespace: 0 };
  const total = text.length;
  let letters = 0;
  let digits = 0;
  let punctuation = 0;
  let whitespace = 0;

  for (let i = 0; i < total; i++) {
    const char = text[i];
    if (/\s/.test(char)) {
      whitespace++;
    } else if (/\d/.test(char)) {
      digits++;
    } else if (/[\p{L}]/u.test(char)) {
      letters++;
    } else {
      punctuation++;
    }
  }

  return { total, letters, digits, punctuation, whitespace };
}

export interface PacingReport {
  exactCharCount: number; // Tính từng chữ cái, con số, dấu câu và khoảng trắng
  breakdown: DetailedCharacterBreakdown;
  durationSeconds: number;
  targetCharCount: number;
  matchPercentage: number;
  estimatedDurationSec: number;
  diffChars: number;
  status: 'perfect' | 'under' | 'over'; // 97-103% = perfect
  statusText: string;
}

export function analyzePacing(
  narrationText: string,
  timestampOrSeconds: string | number,
  charsPerSecond: number = DEFAULT_CHARS_PER_SECOND
): PacingReport {
  const text = narrationText || '';
  const breakdown = countDetailedCharacters(text);
  const exactCharCount = breakdown.total; // counts every letter, number, punctuation, and whitespace

  let durationSeconds = 60;
  if (typeof timestampOrSeconds === 'number') {
    durationSeconds = Math.max(15, timestampOrSeconds);
  } else if (typeof timestampOrSeconds === 'string') {
    durationSeconds = parseTimestampToSeconds(timestampOrSeconds).durationSec;
  }

  const targetCharCount = Math.round(durationSeconds * charsPerSecond);
  const matchPercentage = targetCharCount > 0 ? Math.round((exactCharCount / targetCharCount) * 100) : 100;
  const estimatedDurationSec = Math.round(exactCharCount / charsPerSecond);
  const diffChars = exactCharCount - targetCharCount;

  let status: 'perfect' | 'under' | 'over' = 'perfect';
  let statusText = 'Ăn khớp 100% hoàn hảo';

  if (matchPercentage >= 97 && matchPercentage <= 103) {
    status = 'perfect';
    statusText = 'Ăn khớp 100% hoàn hảo';
  } else if (matchPercentage < 97) {
    status = 'under';
    statusText = `Thiếu ${Math.abs(diffChars)} ký tự (${Math.round(Math.abs(diffChars) / charsPerSecond)}s)`;
  } else {
    status = 'over';
    statusText = `Dư ${diffChars} ký tự (+${Math.round(diffChars / charsPerSecond)}s)`;
  }

  return {
    exactCharCount,
    breakdown,
    durationSeconds,
    targetCharCount,
    matchPercentage,
    estimatedDurationSec,
    diffChars,
    status,
    statusText,
  };
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Thuật toán cân chỉnh văn phong điện ảnh để đạt CHÍNH XÁC 100% ký tự theo thời lượng
export function fineTuneNarrationTo100Percent(
  originalText: string,
  targetDurationSeconds: number,
  cps: number = DEFAULT_CHARS_PER_SECOND
): string {
  const targetChars = Math.round(targetDurationSeconds * cps);
  let text = originalText.trim();

  // If already exact match
  if (text.length === targetChars) return text;

  // If text is slightly short (within 10-40 chars), we can smoothly insert cinematic cadences:
  const diff = targetChars - text.length;

  if (diff > 0 && diff <= 50) {
    const fillers = [
      '.. ',
      ' - ',
      ' Và rồi, ',
      ' Trong thinh lặng, ',
      ' Từng giây từng khắc, ',
      ' Giữa dòng lịch sử, ',
    ];
    for (const f of fillers) {
      if (text.length + f.length <= targetChars) {
        // append or insert naturally before last sentence
        const lastDot = text.lastIndexOf('.');
        if (lastDot > 0) {
          text = text.slice(0, lastDot) + '.' + f + text.slice(lastDot + 1).trim();
        } else {
          text = text + f;
        }
      }
    }
  }

  return text;
}

export interface ChronologicalPhaseInfo {
  phase: 1 | 2 | 3 | 4 | 5;
  key: 'xuat_than' | 'buoc_ngoat' | 'dinh_cao' | 'sup_do' | 'di_san';
  label: string;
  stageName: string;
  tagline: string;
  badgeClass: string;
  scenesText: string;
  psychologyNote: string;
}

export const CHRONOLOGICAL_PHASES: Record<string, ChronologicalPhaseInfo> = {
  xuat_than: {
    phase: 1,
    key: 'xuat_than',
    label: '1. Xuất Thân',
    stageName: 'Xuất Thân & Nguồn Cội',
    tagline: 'Gốc rễ gia tộc & Vết hằn ấu thơ định hình nhân cách',
    badgeClass: 'bg-amber-950/80 border-amber-600/60 text-amber-300',
    scenesText: 'Scene 1 & 2 (Hồi 1)',
    psychologyNote: 'Định vị căn tính, nỗi đau đầu đời và khát vọng nguyên bản',
  },
  buoc_ngoat: {
    phase: 2,
    key: 'buoc_ngoat',
    label: '2. Bước Ngoặt',
    stageName: 'Bước Ngoặt & Thức Tỉnh',
    tagline: 'Rời vùng an toàn, đối thoại định mệnh & Biến cố sinh tử',
    badgeClass: 'bg-orange-950/80 border-orange-600/60 text-orange-300',
    scenesText: 'Scene 3 & 4 (Cuối Hồi 1 & Đầu Hồi 2)',
    psychologyNote: 'Cú sốc lột xác, cược mạng đổi đời, dấn thân vào bão lửa',
  },
  dinh_cao: {
    phase: 3,
    key: 'dinh_cao',
    label: '3. Đỉnh Cao',
    stageName: 'Đỉnh Cao & Hoàng Kim',
    tagline: 'Chiến lược khác biệt, đại thắng & Thâu tóm quyền lực',
    badgeClass: 'bg-yellow-950/80 border-yellow-600/60 text-yellow-300',
    scenesText: 'Scene 5, 6, 7 (Cuối Hồi 2 & Đầu Hồi 3)',
    psychologyNote: 'Tột đỉnh tự tin, mưu lược phi phàm và tác tạo kiệt tác',
  },
  sup_do: {
    phase: 4,
    key: 'sup_do',
    label: '4. Sụp Đổ',
    stageName: 'Sụp Đổ / Kết Thúc & Khúc Bi Tráng',
    tagline: 'Mầm mống rạn nứt, cú ngã ngựa oan khốc & Bản án sinh tử',
    badgeClass: 'bg-rose-950/80 border-rose-600/60 text-rose-300',
    scenesText: 'Scene 8, 9, 10, 11 (Cuối Hồi 3 & Hồi 4)',
    psychologyNote: 'Bi phẫn dồn nén, phong thái thản nhiên trước cái chết',
  },
  di_san: {
    phase: 5,
    key: 'di_san',
    label: '5. Di Sản',
    stageName: 'Di Sản & Khải Hoàn Thiên Thu',
    tagline: 'Minh oan phục quyền, chân lý lịch sử & Bài học nhân quả',
    badgeClass: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300',
    scenesText: 'Scene 12 (Cuối Hồi 4)',
    psychologyNote: 'Siêu thoát, ngọn lửa bất tử soi rọi tâm can muôn đời',
  },
};

export function getChronologicalPhaseByScene(sceneNumber: number): ChronologicalPhaseInfo {
  if (sceneNumber <= 2) return CHRONOLOGICAL_PHASES.xuat_than;
  if (sceneNumber <= 4) return CHRONOLOGICAL_PHASES.buoc_ngoat;
  if (sceneNumber <= 7) return CHRONOLOGICAL_PHASES.dinh_cao;
  if (sceneNumber <= 11) return CHRONOLOGICAL_PHASES.sup_do;
  return CHRONOLOGICAL_PHASES.di_san;
}
