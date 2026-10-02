import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  FileJson,
  Layers,
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  CheckSquare,
  Square,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { MasterScriptProject } from '../types/script';
import { parseImportedFile, ImportSummary } from '../utils/importer';

export interface ImportedBatchItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  formatDetected: 'json' | 'markdown' | 'text';
  characterName: string;
  totalScenes: number;
  totalCharacters: number;
  selected: boolean;
  status: 'success' | 'error';
  errorMessage?: string;
  project?: MasterScriptProject;
  summary?: ImportSummary;
}

interface ImportFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectImported: (project: MasterScriptProject, summary: ImportSummary) => void;
  onBatchProjectsImported?: (projects: MasterScriptProject[], summaries: ImportSummary[]) => void;
}

export const ImportFileModal: React.FC<ImportFileModalProps> = ({
  isOpen,
  onClose,
  onProjectImported,
  onBatchProjectsImported,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingCount, setProcessingCount] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // List of processed batch items
  const [batchItems, setBatchItems] = useState<ImportedBatchItem[]>([]);
  // Detail preview for an item
  const [detailItem, setDetailItem] = useState<ImportedBatchItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter valid files (JSON, MD, TXT)
  const isSupportedFile = (file: File): boolean => {
    const name = file.name.toLowerCase();
    if (name.startsWith('.') || name === 'thumbs.db' || name === 'desktop.ini') return false;
    return (
      name.endsWith('.json') ||
      name.endsWith('.md') ||
      name.endsWith('.markdown') ||
      name.endsWith('.txt')
    );
  };

  const processFileList = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(isSupportedFile);

    if (validFiles.length === 0) {
      setError('Không tìm thấy tệp kịch bản hợp lệ (.json, .md, .txt) trong thư mục hoặc tệp đã chọn.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingCount({ current: 0, total: validFiles.length });

    const newItems: ImportedBatchItem[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setProcessingCount({ current: i + 1, total: validFiles.length });

      try {
        const text = await file.text();
        if (!text || !text.trim()) {
          newItems.push({
            id: `err-${Date.now()}-${i}`,
            file,
            fileName: file.name,
            fileSize: file.size,
            formatDetected: 'text',
            characterName: file.name.replace(/\.[^/.]+$/, ''),
            totalScenes: 0,
            totalCharacters: 0,
            selected: false,
            status: 'error',
            errorMessage: 'Tệp rỗng hoặc không có nội dung văn bản.',
          });
          continue;
        }

        const result = parseImportedFile(text, file.name);
        const allScenes = [
          ...result.project.act1.scenes,
          ...result.project.act2.scenes,
          ...result.project.act3.scenes,
          ...result.project.act4.scenes,
        ];
        const validScenesCount = allScenes.filter((s) => (s.narration || '').length > 0).length || 12;

        newItems.push({
          id: `item-${Date.now()}-${i}`,
          file,
          fileName: file.name,
          fileSize: file.size,
          formatDetected: result.summary.formatDetected,
          characterName: result.project.profile.characterName,
          totalScenes: validScenesCount,
          totalCharacters: result.summary.totalCharactersNarration,
          selected: true,
          status: 'success',
          project: result.project,
          summary: result.summary,
        });
      } catch (err: any) {
        console.warn('Lỗi đọc tệp', file.name, err);
        newItems.push({
          id: `err-${Date.now()}-${i}`,
          file,
          fileName: file.name,
          fileSize: file.size,
          formatDetected: 'text',
          characterName: file.name.replace(/\.[^/.]+$/, ''),
          totalScenes: 0,
          totalCharacters: 0,
          selected: false,
          status: 'error',
          errorMessage: err?.message || 'Không thể đọc tệp kịch bản.',
        });
      }
    }

    setBatchItems((prev) => {
      // Append new items, avoiding exact duplicates by filename
      const existingNames = new Set(prev.map((p) => p.fileName));
      const filteredNew = newItems.filter((item) => !existingNames.has(item.fileName));
      return [...prev, ...filteredNew.length > 0 ? filteredNew : newItems];
    });

    setIsLoading(false);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFileList(files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileList(files);
    }
  };

  // Toggle selection
  const toggleSelectAll = () => {
    const successItems = batchItems.filter((i) => i.status === 'success');
    const allSelected = successItems.every((i) => i.selected);
    setBatchItems((prev) =>
      prev.map((item) => (item.status === 'success' ? { ...item, selected: !allSelected } : item))
    );
  };

  const toggleItemSelect = (id: string) => {
    setBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
    if (detailItem?.id === id) setDetailItem(null);
  };

  // Final confirmation to load into app
  const handleConfirmImport = () => {
    const selectedItems = batchItems.filter((i) => i.selected && i.status === 'success' && i.project);
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất một kịch bản hợp lệ để nạp.');
      return;
    }

    if (selectedItems.length === 1 && selectedItems[0].project && selectedItems[0].summary) {
      onProjectImported(selectedItems[0].project, selectedItems[0].summary);
    } else if (onBatchProjectsImported) {
      const projects = selectedItems.map((i) => i.project!);
      const summaries = selectedItems.map((i) => i.summary!);
      onBatchProjectsImported(projects, summaries);
    } else {
      // Fallback: import the first selected
      onProjectImported(selectedItems[0].project!, selectedItems[0].summary!);
    }

    onClose();
  };

  const successCount = batchItems.filter((i) => i.status === 'success').length;
  const selectedCount = batchItems.filter((i) => i.selected && i.status === 'success').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-800/60 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl shadow-black/90">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center border border-amber-500/40 shadow-md shadow-amber-950 shrink-0">
              <Upload className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-amber-100 flex items-center gap-2">
                IMPORT FILE & FOLDER KỊCH BẢN (CHỌN CÙNG LÚC NHIỀU TỆP)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-600/60 text-emerald-400 font-mono">
                  BATCH AUTO-MAP
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Chọn cùng lúc nhiều file hoặc chọn cả Folder chứa kịch bản trong máy tính để nạp vào hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Hidden Inputs for Multi-file & Folder */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".json,.md,.markdown,.txt"
            onChange={handleFilesSelected}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            // Support webkitdirectory for folder selection
            {...({ webkitdirectory: '', directory: '' } as any)}
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />

          {batchItems.length === 0 ? (
            /* Upload Drop Area */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                dragOver
                  ? 'border-amber-500 bg-amber-950/30 scale-[1.01]'
                  : 'border-stone-700 bg-stone-950/40 hover:border-amber-600/60 hover:bg-stone-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/60">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-700/30 flex items-center justify-center text-amber-400">
                  <FolderOpen className="w-7 h-7" />
                </div>
              </div>

              <div>
                <p className="text-base font-semibold text-stone-200">
                  Kéo và thả nhiều tệp kịch bản hoặc chọn từ máy tính
                </p>
                <p className="text-xs text-stone-400 mt-1 max-w-lg mx-auto">
                  Bạn có thể chọn cùng lúc 5, 10, 20... tệp đã lưu trong ổ cứng, hoặc chỉ cần chọn toàn bộ Thư mục (Folder) để nạp hàng loạt.
                </p>
              </div>

              {/* Two Direct Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/60 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn Cùng Lúc Nhiều Tệp (Ctrl / Shift + Click)</span>
                </button>

                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-600/50 hover:border-amber-500 text-amber-200 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Chọn Nguyên Thư Mục (Folder)</span>
                </button>
              </div>

              {/* Supported format badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-[11px] text-amber-300 font-mono">
                  <FileJson className="w-3.5 h-3.5 text-amber-400" />
                  .JSON (Toàn bộ 4 Hồi, Profile & YouTube)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-[11px] text-emerald-300 font-mono">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  .MD (Markdown Kịch Bản Phân Cảnh)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-[11px] text-cyan-300 font-mono">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  .TXT (Văn bản kịch bản phân đoạn)
                </span>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mọi tệp được đọc và phân tích trực tiếp trên trình duyệt, tuyệt đối bảo mật và tức thì.</span>
              </div>
            </div>
          ) : (
            /* Multi-File Batch Review View */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top Action Bar for Batch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-amber-300 transition-colors"
                  >
                    {selectedCount === successCount && successCount > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-500" />
                    )}
                    <span className="font-medium">
                      Đã chọn ({selectedCount} / {successCount} kịch bản hợp lệ)
                    </span>
                  </button>

                  <span className="text-stone-600">|</span>
                  <span className="text-xs text-stone-400">
                    Tổng số: <strong className="text-stone-200">{batchItems.length}</strong> tệp đã nạp
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thêm File...</span>
                  </button>

                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thêm Folder...</span>
                  </button>

                  <button
                    onClick={() => {
                      setBatchItems([]);
                      setDetailItem(null);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 text-xs transition-colors"
                    title="Xóa tất cả danh sách để chọn lại"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Batch Items List */}
              <div className="border border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-800/80 bg-stone-950/60 max-h-[380px] overflow-y-auto">
                {batchItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.status === 'success' && setDetailItem(item)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      detailItem?.id === item.id
                        ? 'bg-amber-950/40 border-l-4 border-l-amber-500'
                        : 'hover:bg-stone-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.status === 'success') toggleItemSelect(item.id);
                        }}
                        disabled={item.status !== 'success'}
                        className="p-1 text-stone-400 hover:text-amber-300 disabled:opacity-30"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-600" />
                        )}
                      </button>

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                        {item.formatDetected === 'json' ? (
                          <FileJson className="w-4 h-4 text-amber-400" />
                        ) : item.formatDetected === 'markdown' ? (
                          <FileText className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>

                      {/* File Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-amber-200 truncate max-w-[200px] sm:max-w-xs">
                            {item.characterName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                            .{item.formatDetected.toUpperCase()}
                          </span>
                          {item.status === 'success' ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300">
                              12/12 Cảnh
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-600/50 text-rose-300">
                              Lỗi định dạng
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-stone-300">{item.fileName}</span>
                          <span>•</span>
                          <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                          {item.totalCharacters > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-mono">
                                {item.totalCharacters.toLocaleString('vi-VN')} ký tự
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'success' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                          }}
                          className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Xem Chi Tiết</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => removeItem(item.id, e)}
                        className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Xóa tệp này khỏi danh sách nạp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Single Item Detailed Inspector Accordion */}
              {detailItem && detailItem.project && (
                <div className="p-4 rounded-xl bg-stone-950 border border-amber-800/60 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-stone-400">Chi tiết kịch bản:</span>
                      <span className="text-sm font-serif font-bold text-amber-200">
                        {detailItem.project.profile.characterName}
                      </span>
                    </div>
                    <button
                      onClick={() => setDetailItem(null)}
                      className="text-stone-400 hover:text-stone-200 text-xs"
                    >
                      Đóng xem trước ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Thời đại</div>
                      <div className="text-stone-200 truncate mt-0.5">{detailItem.project.profile.era}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Vị trí lịch sử</div>
                      <div className="text-stone-200 truncate mt-0.5">{detailItem.project.profile.historicalRole}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Tỷ lệ Hào/Bi</div>
                      <div className="text-amber-300 mt-0.5 font-mono">
                        {detailItem.project.profile.heroicTragicRatio.heroicPercent}% / {detailItem.project.profile.heroicTragicRatio.tragicPercent}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Thời lượng</div>
                      <div className="text-cyan-300 mt-0.5 font-mono">
                        {detailItem.project.profile.targetDurationMinutes} phút
                      </div>
                    </div>
                  </div>

                  {/* Scene Preview Snapshot */}
                  <div className="text-xs text-stone-300 space-y-1 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                    <div className="text-[11px] font-semibold text-stone-400 uppercase">
                      Trích đoạn Lời bình Hồi 1 (Scene 1):
                    </div>
                    <p className="text-stone-300 italic line-clamp-2">
                      "{detailItem.project.act1.scenes[0]?.narration || 'Chưa có lời bình'}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading indicator with batch progress */}
          {isLoading && (
            <div className="text-center py-6 space-y-2.5">
              <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-amber-300 font-medium">
                Đang đọc và phân tích tệp ({processingCount.current} / {processingCount.total})...
              </p>
              <div className="w-48 h-1.5 bg-stone-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-150"
                  style={{
                    width: `${processingCount.total > 0 ? (processingCount.current / processingCount.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            {batchItems.length > 0 ? (
              <span>
                Đã chọn <strong className="text-amber-300">{selectedCount}</strong> / {successCount} kịch bản hợp lệ
              </span>
            ) : (
              <span>Hỗ trợ chọn cùng lúc nhiều tệp .json, .md, .txt hoặc toàn bộ Folder</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              Đóng
            </button>

            {batchItems.length > 0 ? (
              <button
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {selectedCount > 1
                    ? `Nạp Toàn Bộ ${selectedCount} Kịch Bản Vào App`
                    : `Nạp Kịch Bản Này Vào App`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-950/50 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn Nhiều Tệp</span>
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-600/50 text-amber-200 text-xs font-bold transition-all"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Chọn Thư Mục</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
