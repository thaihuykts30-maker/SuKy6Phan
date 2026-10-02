import { MasterScriptProject } from '../types/script';
import { getSixPartsFromProject } from './pacing';

export function exportToMarkdown(project: MasterScriptProject): string {
  const p = project.profile;
  const prod = project.production;
  const sixParts = getSixPartsFromProject(project);

  return `# ${project.title}
*Thời lượng mục tiêu: ${p.targetDurationMinutes} phút | Tỷ lệ: ${p.heroicTragicRatio.heroicPercent}% Hào Hùng - ${p.heroicTragicRatio.tragicPercent}% Bi Kịch*
*Cấu trúc: Khung Kịch Bản Chuẩn 6 Phần Chính (12 Phân Cảnh Chuẩn Điện Ảnh)*

---

## I. HỒ SƠ PHÂN TÍCH NHÂN VẬT (CHARACTER ARCHITECTURE)
- **Nhân vật:** ${p.characterName} (${p.otherNames || ''})
- **Thời đại / Bối cảnh:** ${p.era}
- **Vị trí lịch sử:** ${p.historicalRole}
- **Hình mẫu cốt lõi (Archetype):** ${p.coreArchetype}
- **Triết lý sống:** ${p.lifePhilosophy}
- **Mâu thuẫn nội tâm:** ${p.innerConflict}
- **Tử huyệt định mệnh / Mầm mống bi kịch:** ${p.fatalFlawOrHubris}
- **Phong cách điện ảnh:** ${p.visualStyle}

---

## II. KỊCH BẢN 6 PHẦN CHÍNH (MASTER 6-PART FRAMEWORK)

${sixParts
  .map(
    (part) => `### ${part.partTitle} (${part.durationPercentage} video • ${part.partDuration})
- **Mục tiêu:** ${part.objective}
- **Cấu trúc mẫu VO:** *"${part.sampleStructure.voFormula}"*
- **Hội thoại kịch tính mẫu:** *${part.sampleStructure.dialogueFormula}*
- **VO kết đoạn:** *"${part.sampleStructure.outroVoFormula}"*

#### Các phân cảnh thuộc ${part.shortTitle}:
${part.scenes
  .map(
    (s) => `##### Phân cảnh ${s.sceneNumber}: ${s.title} [${s.timestamp}]
- **Thời lượng:** ${s.durationSeconds || 75}s (~${s.narration.length} ký tự)
- **Lời bình Voiceover & Thoại:**
${s.narration}
${s.transitionNote ? `\n- **Ghi chú nối mạch (Seamless Flow):** *${s.transitionNote}*` : ''}
- **Image Prompt (Midjourney/Flux):** \`${s.imagePrompt}\`
- **Video Motion Prompt (Runway/Kling/Veo):** \`${s.videoPrompt}\`
- **Âm thanh (SFX & Music):** ${s.audioDesign}
- **Gợi ý nhịp dựng:** ${s.pacingNote}
`
  )
  .join('\n')}
---
`
  )
  .join('\n')}

## III. GÓI SẢN XUẤT (PRODUCTION PACKAGE)
### Tiêu đề YouTube triệu view:
${prod.youtubeMetadata.viralTitles.map((t) => `- ${t}`).join('\n')}

### Ý tưởng Thumbnail:
${prod.youtubeMetadata.thumbnailConcepts.map((t) => `- ${t}`).join('\n')}

### Bảng màu điện ảnh (Color Palette):
- Phần 1 & 2: ${prod.colorPalette.act1Color}
- Phần 3: ${prod.colorPalette.act2Color}
- Phần 4 & 5: ${prod.colorPalette.act3Color}
- Phần 6: ${prod.colorPalette.act4Color}
- Toàn bộ: ${prod.colorPalette.overallMood}

### Thiết kế âm thanh & Âm nhạc:
- Mở đầu: ${prod.musicRecommendations.openingTrackMood}
- Hành quân/Chiến trận: ${prod.musicRecommendations.battleTrackMood}
- Cao trào: ${prod.musicRecommendations.climaxTrackMood}
- Bi thương: ${prod.musicRecommendations.tragicTrackMood}
`;
}

export function downloadFile(filename: string, content: string, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToNarrationText(project: MasterScriptProject): string {
  const p = project.profile;
  const sixParts = getSixPartsFromProject(project);

  let text = `================================================================================
KỊCH BẢN THU ÂM VOICEOVER (6 PHẦN CHÍNH - 12 PHÂN CẢNH): ${project.title.toUpperCase()}
Nhân vật: ${p.characterName} | Thời lượng: ${p.targetDurationMinutes} phút
Tỷ lệ cảm xúc: ${p.heroicTragicRatio.heroicPercent}% Hào Hùng - ${p.heroicTragicRatio.tragicPercent}% Bi Kịch
Quy chuẩn: 13 ký tự/giây | Xen kẽ Voice-over Narrator & Dialogue nhân vật
================================================================================\n\n`;

  sixParts.forEach((part) => {
    text += `\n--------------------------------------------------------------------------------\n`;
    text += `${part.partTitle.toUpperCase()} [${part.durationPercentage} - ${part.partDuration}]\n`;
    text += `Mục tiêu: ${part.objective}\n`;
    text += `--------------------------------------------------------------------------------\n\n`;

    part.scenes.forEach((s) => {
      text += `[PHÂN CẢNH ${s.sceneNumber}: ${s.title.toUpperCase()} (${s.timestamp})] (${s.narration.length} ký tự)\n`;
      text += `(Nhịp điệu: ${s.pacingNote} | SFX: ${s.audioDesign})\n`;
      text += `${s.narration}\n\n`;
      if (s.transitionNote) {
        text += `👉 [Nối mạch]: ${s.transitionNote}\n\n`;
      }
    });
  });

  text += `================================================================================\n`;
  return text;
}

export function exportPromptsToText(project: MasterScriptProject): string {
  const sixParts = getSixPartsFromProject(project);

  let text = `// AI PROMPTS PACK - ${project.title.toUpperCase()}\n`;
  text += `// Chuẩn công thức 6 thành tố: [Chủ Thể & Hành Động] + [Trang Phục] + [Bối Cảnh] + [Góc Quay] + [Ánh Sáng] + [Từ Khóa Sắc Nét 8K/DSLR/Texture/16:9]\n`;
  text += `// Optimized for Midjourney v6.1, Flux.1 Pro, Runway Gen-3, Kling AI, and Veo\n\n`;

  sixParts.forEach((part) => {
    text += `// ======================================================================\n`;
    text += `// ${part.partTitle.toUpperCase()} (${part.durationPercentage})\n`;
    text += `// ======================================================================\n\n`;

    part.scenes.forEach((s) => {
      let img = s.imagePrompt.trim();
      if (!img.includes('--ar')) img = `${img} --ar 16:9`;

      text += `// Phân cảnh ${s.sceneNumber}: ${s.title} [${s.timestamp}]\n`;
      text += `// [MIDJOURNEY / FLUX IMAGE PROMPT (16:9)]: \n${img}\n\n`;
      text += `// [RUNWAY / KLING / VEO VIDEO PROMPT]:\n${s.videoPrompt}\n\n`;
      text += `// [AUDIO & SOUND DESIGN]:\n${s.audioDesign}\n\n`;
    });
  });

  return text;
}

// Export Format 1: Kịch bản liền mạch (Seamless Flow Script Format)
export function exportToSeamlessFlowScript(project: MasterScriptProject): string {
  const sixParts = getSixPartsFromProject(project);

  let output = `================================================================================
KỊCH BẢN LIỀN MẠCH (SEAMLESS FLOW SCRIPT - 6 PHẦN CHÍNH): ${project.title.toUpperCase()}
Nhân vật: ${project.profile.characterName} | Thời đại: ${project.profile.era}
Quy chuẩn: Móc nối Nhân - Quả & Dịch chuyển Góc nhìn Vĩ mô <-> Vi mô qua 6 Phần
================================================================================\n\n`;

  sixParts.forEach((part, partIndex) => {
    output += `[${part.partTitle}]: (${part.durationPercentage} - ${part.partDuration})\n`;
    output += `Mục tiêu: ${part.objective}\n\n`;

    part.scenes.forEach((s, sIndex) => {
      const visualDesc = s.visualDescription || s.imagePrompt || `Mô tả hình ảnh tư liệu phục dựng cho ${s.title}`;
      output += `Scene ${s.sceneNumber}: [${visualDesc}]\n`;
      output += `👉 Lời bình & Thoại: ${s.narration}\n\n`;

      if (s.transitionNote) {
        output += `(Ghi chú nối mạch: ${s.transitionNote})\n\n`;
      }
    });

    if (partIndex < sixParts.length - 1) {
      output += `--------------------------------------------------------------------------------\n\n`;
    }
  });

  return output;
}

// Export Format 2: Phân cảnh Nút Thắt Đạo Diễn Visual & Prompts (Story Beats Format)
export function exportToStoryBeatsPromptSheet(project: MasterScriptProject): string {
  const sixParts = getSixPartsFromProject(project);

  let output = `================================================================================
HỒ SƠ ĐẠO DIỄN HÌNH ẢNH & PROMPT ENGINEER (STORY BEATS VAULT - 6 PHẦN CHÍNH)
Dự án: ${project.title.toUpperCase()}
Nhân vật: ${project.profile.characterName}
Quy chuẩn: Bóc tách Nút Thắt + Midjourney/Flux + Runway Gen-3/Kling/Sora + Ghi chú đạo diễn
================================================================================\n\n`;

  sixParts.forEach((part) => {
    output += `=== ${part.partTitle.toUpperCase()} (${part.durationPercentage}) ===\n\n`;

    part.scenes.forEach((scene) => {
      output += `[Scene ${scene.sceneNumber}: ${scene.title} (${scene.timestamp})]\n\n`;

      if (scene.storyBeats && scene.storyBeats.length > 0) {
        scene.storyBeats.forEach((beat) => {
          output += `${beat.title}:\n`;
          output += `🎙️ Lời bình (Voice-over): "${beat.voiceoverExcerpt}"\n`;
          output += `📸 Image Prompt (EN): ${beat.imagePrompt}\n`;
          output += `🎥 Video Motion Prompt (EN): ${beat.videoMotionPrompt}\n`;
          output += `(Ghi chú đạo diễn: ${beat.directorNote})\n\n`;
        });
      } else {
        output += `Nút thắt 1 (Mở đầu bối cảnh / Gieo cảm xúc):\n`;
        output += `🎙️ Lời bình (Voice-over): "${scene.narration.slice(0, 160)}..."\n`;
        output += `📸 Image Prompt (EN): ${scene.imagePrompt}\n`;
        output += `🎥 Video Motion Prompt (EN): ${scene.videoPrompt}\n`;
        output += `(Ghi chú đạo diễn: Thiết lập không gian điện ảnh và nhịp điệu mở đầu cho phân cảnh)\n\n`;
      }

      output += `--------------------------------------------------------------------------------\n\n`;
    });
  });

  return output;
}

export function exportToJson(project: MasterScriptProject): string {
  return JSON.stringify(project, null, 2);
}
