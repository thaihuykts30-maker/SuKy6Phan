import React, { useState } from 'react';
import { X, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { CinematicScene } from '../types/script';

interface RefineSceneModalProps {
  scene: CinematicScene | null;
  characterName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedScene: CinematicScene) => void;
}

const PRESET_INSTRUCTIONS = [
  'Làm cho lời bình voiceover sâu sắc, hào hùng và giàu hình tượng hơn',
  'Đẩy cao tính bi kịch, làm nổi bật nỗi đau và sự uất nghẹn của nhân vật',
  'Tăng tính dồn dập, căng như dây đàn cho trường đoạn chiến trận / đấu trí',
  'Viết lại prompt hình ảnh Midjourney với ánh sáng điện ảnh Rembrandt 8K',
  'Viết lại prompt video Kling AI với góc máy chuyển động chậm lướt qua khói lửa',
  'Bổ sung chi tiết âm thanh SFX và nhạc cụ truyền thống đặc sắc',
];

export const RefineSceneModal: React.FC<RefineSceneModalProps> = ({
  scene,
  characterName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !scene) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setError('Vui lòng nhập hoặc chọn yêu cầu tinh chỉnh.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/refine-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName,
          scene,
          instruction,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi tinh chỉnh phân cảnh.');
      }

      const resData = await response.json();
      if (resData.refinedScene) {
        onSuccess({
          ...scene,
          ...resData.refinedScene,
        });
        onClose();
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể tinh chỉnh phân cảnh.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-800/80 rounded-2xl shadow-2xl p-6 sm:p-7 text-stone-100">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-200">
              Bác Sĩ Kịch Bản AI: Tinh Chỉnh Phân Cảnh
            </h3>
            <p className="text-xs text-stone-400">
              Scene #{scene.sceneNumber}: {scene.title}
            </p>
          </div>
        </div>

        {/* Current Voiceover preview */}
        <div className="mb-4 p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 italic font-serif border-l-2 border-l-amber-500">
          "{scene.narration}"
        </div>

        {/* Preset Prompt Pills */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
            Chọn Nhanh Yêu Cầu Đạo Diễn:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_INSTRUCTIONS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setInstruction(preset)}
                className="px-2.5 py-1 text-xs rounded-md bg-stone-800 hover:bg-amber-950 border border-stone-700 hover:border-amber-700 text-stone-300 hover:text-amber-200 transition-all text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Instruction Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5">
              Chỉ Dẫn Biên Kịch Cho AI:
            </label>
            <textarea
              rows={3}
              required
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="VD: Viết lại đoạn voiceover với nhịp điệu dồn dập hơn, nhấn mạnh sự cô độc của nhân vật lúc băng hà..."
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 focus:border-amber-500 text-stone-100 text-xs outline-none placeholder:text-stone-600 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-stone-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Đang Nâng Cấp...' : 'Thực Hiện Tinh Chỉnh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
