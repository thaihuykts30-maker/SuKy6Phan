import React from 'react';
import { Anchor, ShieldAlert, Crown, Skull, Quote, Sparkles, MessageSquare, Compass, Copy, Check, Flame, Link2 } from 'lucide-react';
import { Act1Data, Act2Data, Act3Data, Act4Data, CinematicScene } from '../types/script';
import { SceneCard } from './SceneCard';

interface ActCardProps {
  actIndex: 1 | 2 | 3 | 4;
  actData: Act1Data | Act2Data | Act3Data | Act4Data;
  characterName: string;
  onRefineScene: (scene: CinematicScene) => void;
  onUpdateScene?: (updatedScene: CinematicScene) => void;
}

export const ActCard: React.FC<ActCardProps> = ({ actIndex, actData, characterName, onRefineScene, onUpdateScene }) => {
  const [copiedHook, setCopiedHook] = React.useState(false);

  const getActMeta = (index: number) => {
    switch (index) {
      case 1:
        return {
          icon: Anchor,
          badgeColor: 'from-amber-600 to-amber-800 text-amber-200 border-amber-500/40',
          borderColor: 'border-amber-700/50',
          summary: 'Hook giật gân, xuất thân, sự kiện niên thiếu và lời thoại biến cố đầu đời',
        };
      case 2:
        return {
          icon: Compass,
          badgeColor: 'from-orange-600 to-red-800 text-orange-200 border-orange-500/40',
          borderColor: 'border-orange-700/50',
          summary: 'Nghịch cảnh lịch sử, chiến lược độc nhất, nếm mật nằm gai và cao trào vinh quang bước đầu',
        };
      case 3:
        return {
          icon: Crown,
          badgeColor: 'from-yellow-600 to-amber-900 text-yellow-200 border-yellow-500/40',
          borderColor: 'border-yellow-700/50',
          summary: 'Đỉnh cao sự nghiệp, di sản vĩ đại và mầm mống rạn nứt/sai lầm chí mạng trong phòng kín',
        };
      case 4:
        return {
          icon: Skull,
          badgeColor: 'from-rose-700 to-stone-900 text-rose-200 border-rose-600/40',
          borderColor: 'border-rose-800/50',
          summary: 'Biến cố chấn động, khí chất đối diện tử thần, công minh lịch sử và lời bình lay động tâm can',
        };
      default:
        return {
          icon: Sparkles,
          badgeColor: 'from-stone-700 to-stone-900 text-stone-200 border-stone-600/40',
          borderColor: 'border-stone-700/50',
          summary: '',
        };
    }
  };

  const meta = getActMeta(actIndex);
  const Icon = meta.icon;

  const copyHookText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  return (
    <div className={`rounded-2xl bg-stone-900/60 border ${meta.borderColor} shadow-2xl p-5 sm:p-7 space-y-6`}>
      {/* Act Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.badgeColor} flex items-center justify-center border shadow-lg`}>
            <Icon className="w-5 h-5 text-stone-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                {actData.actTitle}
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-amber-300">
                {actData.actDuration}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{meta.summary}</p>
          </div>
        </div>
      </div>

      {/* ACT 1 SPECIFIC STRUCTURAL BLOCKS */}
      {actIndex === 1 && 'hook' in actData && (
        <div className="space-y-4">
          {/* The Golden Hook */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-950/30 border border-amber-600/40 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Quote className="w-4 h-4 text-amber-400" />
                <span>Lưỡi Câu Mở Đầu (Hook 1 Phút Đầu - Đánh Thẳng Vào Thành Tựu Hoặc Cái Chết):</span>
              </div>
              <button
                onClick={() => copyHookText(actData.hook.openingStatement)}
                className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1 px-2 py-0.5 rounded hover:bg-stone-800 transition-colors"
              >
                {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHook ? 'Đã chép' : 'Chép Hook'}</span>
              </button>
            </div>
            <p className="text-base sm:text-lg font-serif font-semibold text-amber-100 leading-snug italic border-l-4 border-amber-500 pl-4 py-1">
              "{actData.hook.openingStatement}"
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-1 border-t border-stone-800/80">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-medium">Tông giọng Voiceover:</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                  {actData.hook.voiceoverTone}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-stone-300 font-semibold">{actData.hook.openingStatement.length} ký tự</span>
                <span className="text-stone-500">• ~{Math.round(actData.hook.openingStatement.length / 13)}s đọc</span>
              </div>
            </div>
          </div>

          {/* Origin & Core Philosophy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Xuất Thân & Bối Cảnh Thời Cuộc
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {actData.originAndCore.familyAndSocialContext}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Sự Kiện Niên Thiếu Định Hình Triết Lý
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {actData.originAndCore.definingYouthEvent}
              </p>
              {actData.originAndCore.corePhilosophy && (
                <div className="text-xs text-amber-200/90 font-serif pt-1 border-t border-stone-800/80">
                  <span className="text-amber-400 font-semibold font-sans">Triết lý sống: </span>
                  {actData.originAndCore.corePhilosophy}
                </div>
              )}
            </div>
          </div>

          {/* Golden Dialogue 1 */}
          <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Cảnh Thoại Đắt Giá 1 (Bước Ngoặt Dấn Thân):</span>
            </div>
            <div className="text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>Nhân vật:</strong> {actData.goldenDialogue1.characters}</span>
              <span><strong>Bối cảnh:</strong> {actData.goldenDialogue1.setting}</span>
            </div>
            <blockquote className="p-3 rounded-lg bg-stone-900/80 border-l-2 border-amber-500 font-serif italic text-amber-100 text-sm">
              "{actData.goldenDialogue1.dialogueText}"
            </blockquote>
            <p className="text-[11px] text-stone-400">
              <strong className="text-stone-300">Ý nghĩa kịch tính:</strong> {actData.goldenDialogue1.dramaticSignificance}
            </p>
          </div>
        </div>
      )}

      {/* ACT 2 SPECIFIC STRUCTURAL BLOCKS */}
      {actIndex === 2 && 'distinctStrategy' in actData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Nỗi Đau / Bối Cảnh Rối Ren & Nghịch Cảnh
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {actData.painPointAndCrisis}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Chiến Lược Khác Biệt (Đột Phá Không Ngờ)
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {actData.distinctStrategy}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Hành Trình Vượt Khó (Nếm Mật Nằm Gai)
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {actData.hardshipJourney}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-stone-950 border border-amber-600/40 space-y-2">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Cao Trào 1: Thành Tựu Bước Đầu Rực Rỡ
            </h4>
            <p className="text-xs text-amber-100 font-serif leading-relaxed">
              {actData.climax1}
            </p>
          </div>
        </div>
      )}

      {/* ACT 3 SPECIFIC STRUCTURAL BLOCKS */}
      {actIndex === 3 && 'seedsOfDoom' in actData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2">
              <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                Thời Kỳ Hoàng Kim & Di Sản Vĩ Đại
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {actData.goldenAge}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Mầm Mống Tai Họa (Yếu Tố Then Chốt)
              </h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {actData.seedsOfDoom}
              </p>
            </div>
          </div>

          {/* Golden Dialogue 2 */}
          <div className="p-4 rounded-xl bg-stone-950/90 border border-yellow-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-yellow-400" />
              <span>Cảnh Thoại Đắt Giá 2 (Lời Cảnh Báo Tử Thần / Mật Đàm Phòng Kín):</span>
            </div>
            <div className="text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>Nhân vật:</strong> {actData.goldenDialogue2.characters}</span>
              <span><strong>Bối cảnh:</strong> {actData.goldenDialogue2.setting}</span>
            </div>
            <blockquote className="p-3 rounded-lg bg-stone-900/80 border-l-2 border-yellow-500 font-serif italic text-yellow-100 text-sm">
              "{actData.goldenDialogue2.dialogueText}"
            </blockquote>
            <p className="text-[11px] text-stone-400">
              <strong className="text-stone-300">Ý nghĩa kịch tính:</strong> {actData.goldenDialogue2.dramaticSignificance}
            </p>
          </div>
        </div>
      )}

      {/* ACT 4 SPECIFIC STRUCTURAL BLOCKS */}
      {actIndex === 4 && 'cataclysmicEvent' in actData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 space-y-2">
              <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
                Biến Cố Chấn Động (Không Thể Vãn Hồi)
              </h4>
              <p className="text-xs text-rose-100 leading-relaxed">
                {actData.cataclysmicEvent}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Kết Cục Bi Thương & Khí Phách Đối Diện Số Phận
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {actData.tragicEnd}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Phục Quyền & Di Sản Thiên Thu (Đánh Giá Lịch Sử)
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {actData.redemptionAndLegacy}
            </p>
          </div>

          {/* Closing Reflection & Thought-provoking Conclusion */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lời Bình Kết Luận (Thought-provoking Outro & CTA):</span>
              </div>
              <div className="font-mono text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className="text-amber-300 font-semibold">{actData.closingReflection.length} ký tự</span>
                <span className="text-stone-500">• ~{Math.round(actData.closingReflection.length / 13)}s đọc</span>
              </div>
            </div>
            <p className="text-sm font-serif italic text-amber-100 leading-relaxed border-l-2 border-amber-500 pl-3">
              "{actData.closingReflection}"
            </p>
          </div>
        </div>
      )}

      {/* Cinematic Scene Breakdown for this Act */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Danh Sách Phân Cảnh Chi Tiết ({actData.scenes.length} Scenes)
            </span>
          </div>
          <span className="text-xs text-stone-500">
            Voiceover Căn Khớp Thời Lượng + Midjourney + Kling Prompts
          </span>
        </div>

        <div className="space-y-4">
          {actData.scenes.map((scene) => (
            <SceneCard
              key={scene.id || scene.sceneNumber}
              scene={scene}
              actName={actData.actTitle}
              actIndex={actIndex}
              characterName={characterName}
              onRefineScene={onRefineScene}
              onUpdateScene={onUpdateScene}
            />
          ))}
        </div>

        {/* SEAMLESS FLOW: CÂU CHỐT HỒI - GIEO MỒI LỬA CHUYỂN GIAO SANG HỒI TIẾP THEO */}
        {'actTransitionCliffhanger' in actData && actData.actTransitionCliffhanger && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border border-amber-500/50 space-y-2 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Câu Chốt Hồi {actIndex} — Gieo Mồi Lửa Chuyển Giao Sang Hồi {actIndex + 1}:</span>
            </div>
            <p className="text-sm font-serif italic text-amber-100 leading-relaxed pl-3.5 border-l-2 border-amber-500">
              "{actData.actTransitionCliffhanger}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
