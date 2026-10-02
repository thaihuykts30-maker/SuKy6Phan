import React, { useState } from 'react';
import { ScrollText, Sparkles, BookOpen, Download, Mic, Check, ChevronDown, FileText, Copy, Film, Upload, FileJson } from 'lucide-react';
import { MasterScriptProject } from '../types/script';
import {
  exportToMarkdown,
  exportToNarrationText,
  exportPromptsToText,
  exportToSeamlessFlowScript,
  exportToStoryBeatsPromptSheet,
  exportToJson,
  downloadFile,
} from '../utils/export';

interface HeaderProps {
  currentProject: MasterScriptProject;
  sampleProjects: MasterScriptProject[];
  onSelectProject: (project: MasterScriptProject) => void;
  onOpenCreateModal: () => void;
  onOpenTeleprompter: () => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  sampleProjects,
  onSelectProject,
  onOpenCreateModal,
  onOpenTeleprompter,
  onOpenImportModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const slug = currentProject.profile.characterName.toLowerCase().replace(/\s+/g, '-');

  const handleDownloadJson = () => {
    const jsonStr = exportToJson(currentProject);
    downloadFile(`${slug}-master-script-data.json`, jsonStr, 'application/json');
    setExportMenuOpen(false);
  };

  const handleDownloadMarkdown = () => {
    const md = exportToMarkdown(currentProject);
    downloadFile(`${slug}-kich-ban-6-phan.md`, md, 'text/markdown');
    setExportMenuOpen(false);
  };

  const handleDownloadNarrationTxt = () => {
    const txt = exportToNarrationText(currentProject);
    downloadFile(`${slug}-voiceover-script.txt`, txt, 'text/plain');
    setExportMenuOpen(false);
  };

  const handleDownloadPromptsTxt = () => {
    const txt = exportPromptsToText(currentProject);
    downloadFile(`${slug}-ai-prompts.txt`, txt, 'text/plain');
    setExportMenuOpen(false);
  };

  const handleDownloadSeamlessTxt = () => {
    const txt = exportToSeamlessFlowScript(currentProject);
    downloadFile(`${slug}-kich-ban-noi-mach-seamless-flow.txt`, txt, 'text/plain');
    setExportMenuOpen(false);
  };

  const handleDownloadStoryBeatsTxt = () => {
    const txt = exportToStoryBeatsPromptSheet(currentProject);
    downloadFile(`${slug}-dao-dien-visual-story-beats.txt`, txt, 'text/plain');
    setExportMenuOpen(false);
  };

  const handleCopyClipboard = () => {
    const md = exportToMarkdown(currentProject);
    navigator.clipboard.writeText(md);
    setCopyFeedback(true);
    setTimeout(() => {
      setCopyFeedback(false);
      setExportMenuOpen(false);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-amber-900/40 text-stone-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-lg shadow-amber-950/60 border border-amber-500/30">
            <ScrollText className="w-6 h-6 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wider text-lg bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                SỬ KÝ 6 PHẦN
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono">
                MASTER 6-PART FRAMEWORK
              </span>
            </div>
            <p className="text-xs text-stone-400 font-sans hidden sm:block">
              Studio Biên Kịch Phim Tài Liệu Lịch Sử 6 Phần Chính (20 - 35 Phút) & AI Prompts
            </p>
          </div>
        </div>

        {/* Center / Project Switcher */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setExportMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-stone-900 border border-amber-900/50 hover:border-amber-700/80 text-stone-200 text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[200px] truncate text-amber-200 font-serif">
                {currentProject.profile.characterName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-68 rounded-md bg-stone-900 border border-amber-800/60 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-500 uppercase tracking-wider border-b border-stone-800">
                  Nhân Vật Mẫu Đỉnh Cao
                </div>
                {sampleProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-950/40 transition-colors ${
                      currentProject.id === proj.id ? 'bg-amber-950/50 text-amber-300 font-semibold' : 'text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-serif">{proj.profile.characterName}</div>
                      <div className="text-[10px] text-stone-400 truncate max-w-[200px]">
                        {proj.profile.historicalRole}
                      </div>
                    </div>
                    {currentProject.id === proj.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* IMPORT FILE BUTTON - Prominent directly on header */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-amber-500/70 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-sm shadow-amber-950/40 transition-all group"
            title="Nhập file từ máy tính (.json, .md, .txt) - Tự động nạp vào cấu trúc 6 Phần Chính"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium tracking-wide">IMPORT FILE</span>
            <span className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-amber-950 border border-amber-600/40 text-amber-400 font-mono">
              Auto-Map
            </span>
          </button>

          {/* Teleprompter quick button */}
          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-medium transition-all"
            title="Mở phòng thu đọc voiceover và máy nhắc chữ"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Phòng Thu Voice</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setExportMenuOpen(!exportMenuOpen);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-medium transition-all"
              title="Xuất kịch bản ra các định dạng"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Xuất Bản</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-68 rounded-xl bg-stone-900 border border-stone-700/80 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                  Tùy Chọn Xuất Bản
                </div>
                
                <button
                  onClick={handleDownloadJson}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium text-amber-200">Dữ Liệu Dự Án Gốc (.json)</div>
                    <div className="text-[10px] text-stone-400">Chuẩn JSON để lưu trữ và Import lại 100%</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium">Kịch Bản Đầy Đủ 6 Phần (.md)</div>
                    <div className="text-[10px] text-stone-400">Chuẩn Markdown gồm 6 Phần chính & Gói sản xuất</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadNarrationTxt}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-medium">Lời Bình Thu Âm (.txt)</div>
                    <div className="text-[10px] text-stone-400">Tối ưu cho phát thanh viên / Voiceover</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadPromptsTxt}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-medium">Bộ Prompt Video & Ảnh (.txt)</div>
                    <div className="text-[10px] text-stone-400">Dành cho Midjourney, Kling, Veo</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadSeamlessTxt}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <ScrollText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium">Kịch Bản Nối Mạch (Format 1) (.txt)</div>
                    <div className="text-[10px] text-stone-400">Chuẩn Seamless Flow, Cause & Effect, Cliffhanger</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadStoryBeatsTxt}
                  className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center gap-2 transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium">Hồ Sơ Nút Thắt Visual (Format 2) (.txt)</div>
                    <div className="text-[10px] text-stone-400">Bóc tách Story Beats + Midjourney + Runway Gen-3</div>
                  </div>
                </button>

                <div className="border-t border-stone-800 pt-1">
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      onOpenImportModal();
                    }}
                    className="w-full text-left px-3 py-2 text-amber-300 hover:bg-amber-950/60 flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-amber-200">Import File Từ Máy Tính...</div>
                      <div className="text-[10px] text-stone-400">Nạp tệp .json, .md, .txt vào cấu trúc</div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-stone-800 pt-1">
                  <button
                    onClick={handleCopyClipboard}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-amber-950/50 hover:text-amber-300 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Sao Chép Markdown Vào Clipboard</span>
                    </div>
                    {copyFeedback && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create new script button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-xs shadow-lg shadow-amber-900/40 hover:shadow-amber-900/60 transition-all border border-amber-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>Tạo Kịch Bản Mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
