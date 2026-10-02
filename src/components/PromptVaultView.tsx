import React, { useState } from 'react';
import { Video, Image as ImageIcon, Copy, Check, Download, Filter, Film, Search, FileText, Sparkles } from 'lucide-react';
import { MasterScriptProject } from '../types/script';
import { downloadFile, exportPromptsToText, exportToStoryBeatsPromptSheet } from '../utils/export';

interface PromptVaultViewProps {
  project: MasterScriptProject;
}

export const PromptVaultView: React.FC<PromptVaultViewProps> = ({ project }) => {
  const [selectedAct, setSelectedAct] = useState<number | 'all'>('all');
  const [promptTypeFilter, setPromptTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedBatch, setCopiedBatch] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Collect all scenes with their parent Act metadata
  const allScenes = [
    ...project.act1.scenes.map((s) => ({ ...s, actIndex: 1, actTitle: project.act1.actTitle })),
    ...project.act2.scenes.map((s) => ({ ...s, actIndex: 2, actTitle: project.act2.actTitle })),
    ...project.act3.scenes.map((s) => ({ ...s, actIndex: 3, actTitle: project.act3.actTitle })),
    ...project.act4.scenes.map((s) => ({ ...s, actIndex: 4, actTitle: project.act4.actTitle })),
  ];

  const filteredScenes = allScenes.filter((s) => {
    if (selectedAct !== 'all' && s.actIndex !== selectedAct) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchNarration = s.narration.toLowerCase().includes(q);
      const matchImg = s.imagePrompt.toLowerCase().includes(q);
      const matchVid = s.videoPrompt.toLowerCase().includes(q);
      return matchTitle || matchNarration || matchImg || matchVid;
    }
    return true;
  });

  const copyIndividual = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyAllVideoPrompts = () => {
    const text = allScenes
      .map(
        (s) =>
          `// Scene ${s.sceneNumber}: ${s.title} [${s.timestamp}]\n${s.videoPrompt}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatch('video');
    setTimeout(() => setCopiedBatch(null), 2000);
  };

  const copyAllImagePrompts = () => {
    const text = allScenes
      .map(
        (s) =>
          `// Scene ${s.sceneNumber}: ${s.title} [${s.timestamp}]\n${s.imagePrompt}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatch('image');
    setTimeout(() => setCopiedBatch(null), 2000);
  };

  const downloadPromptPackJson = () => {
    const data = {
      projectTitle: project.title,
      character: project.profile.characterName,
      totalScenes: allScenes.length,
      scenes: allScenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        timestamp: s.timestamp,
        title: s.title,
        act: s.actTitle,
        imagePrompt: s.imagePrompt,
        videoPrompt: s.videoPrompt,
        audioCues: s.audioDesign,
      })),
    };
    downloadFile(
      `${project.profile.characterName.toLowerCase().replace(/\s+/g, '-')}-ai-prompts.json`,
      JSON.stringify(data, null, 2),
      'application/json'
    );
  };

  const downloadPromptPackTxt = () => {
    const text = exportPromptsToText(project);
    downloadFile(
      `${project.profile.characterName.toLowerCase().replace(/\s+/g, '-')}-ai-prompts.txt`,
      text,
      'text/plain'
    );
  };

  const downloadStoryBeatsTxt = () => {
    const text = exportToStoryBeatsPromptSheet(project);
    downloadFile(
      `${project.profile.characterName.toLowerCase().replace(/\s+/g, '-')}-story-beats-vault.txt`,
      text,
      'text/plain'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-stone-100">
              Kho Prompt Video & Hình Ảnh Điện Ảnh AI
            </h2>
          </div>
          <p className="text-xs text-stone-400">
            Tổng cộng <strong>{allScenes.length} phân cảnh</strong> được chuẩn hóa bằng tiếng Anh chuyên nghiệp cho Midjourney, Flux, Kling, Runway Gen-3 & Veo.
          </p>
        </div>

        {/* Batch action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyAllVideoPrompts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium transition-all"
          >
            {copiedBatch === 'video' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBatch === 'video' ? 'Đã Chép Hết Video' : 'Chép Toàn Bộ Video Prompts'}</span>
          </button>

          <button
            onClick={copyAllImagePrompts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium transition-all"
          >
            {copiedBatch === 'image' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBatch === 'image' ? 'Đã Chép Hết Ảnh' : 'Chép Toàn Bộ Image Prompts'}</span>
          </button>

          <button
            onClick={downloadPromptPackTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-all border border-stone-700"
            title="Tải tệp văn bản .txt"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Tải .txt</span>
          </button>

          <button
            onClick={downloadStoryBeatsTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-cyan-300 text-xs font-medium transition-all border border-cyan-800/60"
            title="Tải toàn bộ hồ sơ Nút Thắt Story Beats Format 2"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tải Nút Thắt (Format 2)</span>
          </button>

          <button
            onClick={downloadPromptPackJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-bold transition-all shadow-md"
            title="Tải tệp dữ liệu .json"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải .json</span>
          </button>
        </div>
      </div>

      {/* 6-Part Prompt Formula Banner */}
      <div className="p-3.5 rounded-xl bg-stone-900/90 border border-emerald-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] font-mono">
              CHUẨN PROMPT SẮC NÉT 16:9 CHO YOUTUBE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold">
              4 Nhóm Từ Khóa Bắt Buộc
            </span>
          </div>
          <p className="text-[11px] text-stone-300 font-mono leading-relaxed">
            [Chủ Thể] + [Trang Phục] + [Bối Cảnh] + [Góc Quay] + [Ánh Sáng] + 8k/photorealistic + DSLR/35mm + skin/metal texture + --ar 16:9
          </p>
        </div>
        <button
          onClick={() => {
            const template = `[Chủ Thể Chính & Hành Động] + [Chi Tiết Trang Phục Lịch Sử] + [Môi Trường & Bối Cảnh] + [Góc Quay & Bố Cục] + [Ánh Sáng & Tâm Trạng] + 8k, hyper-detailed, photorealistic, highly detailed, intricate detail, DSLR, 35mm lens, sharp focus, crystal clear, professional photography, candid style, detailed skin texture, pore-level detail, individual fabric weave, scratched metal texture, dynamic range --ar 16:9`;
            navigator.clipboard.writeText(template);
            setCopiedBatch('template');
            setTimeout(() => setCopiedBatch(null), 2000);
          }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-950 border border-emerald-800 text-emerald-300 hover:text-emerald-200 text-xs font-mono transition-colors"
        >
          {copiedBatch === 'template' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedBatch === 'template' ? 'Đã chép Template' : 'Sao chép Template chuẩn'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
        {/* Filter by Act */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Hồi:
          </span>
          <button
            onClick={() => setSelectedAct('all')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              selectedAct === 'all'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất Cả ({allScenes.length})
          </button>
          {[1, 2, 3, 4].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAct(act as any)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedAct === act
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              Hồi {act}
            </button>
          ))}
        </div>

        {/* Search input & prompt type filter */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm từ khóa prompt..."
              className="pl-8 pr-3 py-1 text-xs rounded-lg bg-stone-900 border border-stone-800 text-stone-200 outline-none focus:border-amber-500 placeholder:text-stone-600 w-36 sm:w-48"
            />
          </div>

          {/* Type toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPromptTypeFilter('all')}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                promptTypeFilter === 'all' ? 'bg-stone-800 text-stone-100 font-medium' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setPromptTypeFilter('image')}
              className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
                promptTypeFilter === 'image' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium' : 'text-stone-500 hover:text-emerald-400'
              }`}
            >
              <ImageIcon className="w-3 h-3" /> Ảnh
            </button>
            <button
              onClick={() => setPromptTypeFilter('video')}
              className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
                promptTypeFilter === 'video' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium' : 'text-stone-500 hover:text-cyan-400'
              }`}
            >
              <Video className="w-3 h-3" /> Video
            </button>
          </div>
        </div>
      </div>

      {/* Prompts Cards List */}
      <div className="space-y-4">
        {filteredScenes.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            Không tìm thấy phân cảnh nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          filteredScenes.map((scene) => (
            <div
              key={scene.id || scene.sceneNumber}
              className="p-5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-800/50 shadow-md space-y-3 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                    Scene #{scene.sceneNumber}
                  </span>
                  <span className="font-serif font-bold text-stone-100 text-sm">
                    {scene.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="text-amber-400/90 font-medium">{scene.actTitle}</span>
                  <span>•</span>
                  <span className="font-mono">{scene.timestamp}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Prompt */}
                {(promptTypeFilter === 'all' || promptTypeFilter === 'image') && (
                  <div className="rounded-lg bg-stone-950 p-3.5 border border-stone-800/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Image Prompt (Midjourney / Flux):
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold">
                          --ar 16:9
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyIndividual(scene.imagePrompt, `img-${scene.sceneNumber}`)}
                          className="text-stone-400 hover:text-emerald-300 text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-stone-800 transition-colors"
                          title="Sao chép prompt chuẩn sắc nét 16:9"
                        >
                          {copiedItem === `img-${scene.sceneNumber}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedItem === `img-${scene.sceneNumber}` ? 'Đã chép' : 'Chép'}</span>
                        </button>

                        <button
                          onClick={() => {
                            let prompt = scene.imagePrompt;
                            if (!prompt.includes('--v 6.1')) {
                              prompt = `${prompt.replace(/--ar\s+16:9/g, '').trim()} --v 6.1 --style raw --ar 16:9`;
                            }
                            copyIndividual(prompt, `mj-${scene.sceneNumber}`);
                          }}
                          className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-amber-900/50 transition-colors"
                          title="Sao chép câu lệnh kèm tham số --v 6.1 --style raw --ar 16:9"
                        >
                          {copiedItem === `mj-${scene.sceneNumber}` ? (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{copiedItem === `mj-${scene.sceneNumber}` ? 'Đã chép v6.1' : '+ MJ v6.1'}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-stone-300 leading-relaxed select-all">
                      {scene.imagePrompt}
                    </p>
                  </div>
                )}

                {/* Video Prompt */}
                {(promptTypeFilter === 'all' || promptTypeFilter === 'video') && (
                  <div className="rounded-lg bg-stone-950 p-3.5 border border-stone-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        Runway / Kling / Veo Motion Prompt:
                      </span>
                      <button
                        onClick={() => copyIndividual(scene.videoPrompt, `vid-${scene.sceneNumber}`)}
                        className="text-stone-400 hover:text-cyan-300 text-xs flex items-center gap-1 px-2 py-0.5 rounded hover:bg-stone-900 transition-colors"
                      >
                        {copiedItem === `vid-${scene.sceneNumber}` ? (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedItem === `vid-${scene.sceneNumber}` ? 'Đã chép' : 'Chép'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-stone-300 leading-relaxed select-all">
                      {scene.videoPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
