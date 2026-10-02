import React, { useState } from 'react';
import {
  User,
  Flame,
  Compass,
  HeartHandshake,
  AlertTriangle,
  Eye,
  Palette,
  Music,
  Youtube,
  Copy,
  Check,
  Clock,
  Gauge,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  LayoutList,
} from 'lucide-react';
import { HistoricalProfile, ProductionPackage } from '../types/script';

interface CharacterProfileViewProps {
  profile: HistoricalProfile;
  production: ProductionPackage;
}

export const CharacterProfileView: React.FC<CharacterProfileViewProps> = ({ profile, production }) => {
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [analysisViewTab, setAnalysisViewTab] = useState<'cards' | 'raw_text'>('cards');

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTitleIndex(index);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  const handleCopyAnalysis = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnalysis(true);
    setTimeout(() => setCopiedAnalysis(false), 2000);
  };

  const heroic = profile.heroicTragicRatio.heroicPercent;
  const tragic = profile.heroicTragicRatio.tragicPercent;
  const sixParts = profile.directorSixPartAnalysis;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Core Character Identity */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-800/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300">
                  {profile.era}
                </span>
                {profile.otherNames && (
                  <span className="text-xs text-stone-400">({profile.otherNames})</span>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-amber-100 tracking-wide">
                {profile.characterName}
              </h1>
              <p className="text-sm sm:text-base text-amber-300/90 font-serif mt-1">
                {profile.historicalRole}
              </p>
            </div>

            {/* Emotional balance badge */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2 min-w-[240px]">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-amber-400">{heroic}% Hào Hùng</span>
                <span className="text-rose-400">{tragic}% Bi Kịch</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-stone-800">
                <div style={{ width: `${heroic}%` }} className="bg-gradient-to-r from-amber-500 to-amber-400" />
                <div style={{ width: `${tragic}%` }} className="bg-gradient-to-r from-rose-800 to-rose-600" />
              </div>
              <p className="text-[10px] text-stone-400 text-center">
                Thời lượng video: <strong>{profile.targetDurationMinutes} phút</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: 6-PART DIRECTOR & SCREENWRITER ANALYSIS (If available) */}
      {sixParts && (
        <div className="rounded-2xl bg-stone-900/90 border border-amber-600/60 p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-amber-300">
                  Bản Phân Tích Đạo Diễn & Biên Kịch (Cấu Trúc 6 Phần Chính)
                </h3>
                <p className="text-xs text-stone-400">
                  Nền tảng phân tích đã được đạo diễn áp dụng trực tiếp vào cấu trúc 6 Phần chính (12 Phân Cảnh)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAnalysisViewTab('cards')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    analysisViewTab === 'cards'
                      ? 'bg-amber-600 text-stone-950'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <LayoutList className="w-3 h-3 inline mr-1" />
                  Thẻ 6 Phần
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisViewTab('raw_text')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    analysisViewTab === 'raw_text'
                      ? 'bg-amber-600 text-stone-950'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <FileText className="w-3 h-3 inline mr-1" />
                  Format 1/ - 6/
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyAnalysis(sixParts.fullFormattedText)}
                className="px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Sao chép toàn bộ bản phân tích 6 phần"
              >
                {copiedAnalysis ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedAnalysis ? 'Đã sao chép' : 'Sao chép 6 phần'}</span>
              </button>
            </div>
          </div>

          {analysisViewTab === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1/ Bối cảnh */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  1/ Thời Đại / Bối Cảnh Lịch Sử:
                </span>
                <p className="text-stone-200 leading-relaxed font-serif">
                  {sixParts.historicalEraAndContext}
                </p>
              </div>

              {/* 2/ Thời lượng & 4 Hồi */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    2/ Thời Lượng Phân Bổ: [{sixParts.durationBreakdown.totalDuration}]
                  </span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="text-stone-300"><strong className="text-amber-300">Hồi 1:</strong> {sixParts.durationBreakdown.act1NameAndSummary}</div>
                  <div className="text-stone-300"><strong className="text-orange-300">Hồi 2:</strong> {sixParts.durationBreakdown.act2NameAndSummary}</div>
                  <div className="text-stone-300"><strong className="text-yellow-300">Hồi 3:</strong> {sixParts.durationBreakdown.act3NameAndSummary}</div>
                  <div className="text-stone-300"><strong className="text-rose-300">Hồi 4:</strong> {sixParts.durationBreakdown.act4NameAndSummary}</div>
                </div>
              </div>

              {/* 3/ Giọng đọc */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    3/ Tốc Độ Phát Thanh Viên (Giọng Đọc):
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300 font-mono text-[10px]">
                    {sixParts.voiceoverPacingTech.cps || 13} ký tự/giây
                  </span>
                </span>
                <p className="text-stone-200 leading-relaxed">
                  {sixParts.voiceoverPacingTech.analysis}
                </p>
              </div>

              {/* 4/ Phong cách */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    4/ Phong Cách & Tông Giọng Đạo Diễn:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300 font-mono text-[10px]">
                    {sixParts.directorStyleAndTone.styleName || 'Sử thi bi tráng'}
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(sixParts.directorStyleAndTone.keywords || []).map((k, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 text-[10px] font-mono">
                      #{k}
                    </span>
                  ))}
                </div>
                <p className="text-stone-200 leading-relaxed">
                  {sixParts.directorStyleAndTone.applicationGuide}
                </p>
              </div>

              {/* 5/ Cảm xúc & Âm nhạc */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    5/ Tỉ Lệ Cảm Xúc 6 Phần & Không Gian Âm Nhạc:
                  </span>
                  <span className="font-mono text-[10px] text-amber-400">
                    {sixParts.actEmotionMusicRatio.heroicPercent}% Hào Hùng / {sixParts.actEmotionMusicRatio.tragicPercent}% Bi Kịch
                  </span>
                </span>
                <p className="text-stone-200 leading-relaxed">
                  {sixParts.actEmotionMusicRatio.actAtmosphereAndMusic}
                </p>
              </div>

              {/* 6/ Góc nhìn đặc biệt */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 space-y-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  6/ Góc Nhìn Khai Thác Đặc Biệt (Tâm Lý & Phá Cách):
                </span>
                <ul className="space-y-1 pl-1">
                  {(sixParts.specialPerspectives || []).map((p, idx) => (
                    <li key={idx} className="text-stone-200 leading-relaxed flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all max-h-[380px] overflow-y-auto">
              {sixParts.fullFormattedText}
            </pre>
          )}
        </div>
      )}

      {/* 4 Pillars of Character Architecture */}
      <div>
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>4 Trụ Cột Phân Tích Cốt Lõi Nhân Vật:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Core Archetype */}
          <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-400" />
              <span>Hình Mẫu Nhân Vật (Core Archetype):</span>
            </div>
            <p className="text-sm font-serif font-bold text-stone-100">
              {profile.coreArchetype}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Khuôn mẫu tâm lý và biểu tượng văn hóa mà nhân vật đại diện trong tâm thức khán giả qua các thời kỳ.
            </p>
          </div>

          {/* Pillar 2: Life Philosophy */}
          <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Triết Lý Sống & Nguyên Tắc Tối Thượng:</span>
            </div>
            <p className="text-sm font-serif italic text-emerald-100 border-l-2 border-emerald-500 pl-3 py-0.5">
              "{profile.lifePhilosophy}"
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Kim chỉ nam định hình mọi quyết định mang tính sinh tử trong suốt cuộc đời của nhân vật.
            </p>
          </div>

          {/* Pillar 3: Inner Conflict */}
          <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span>Mâu Thuẫn Giằng Xé Nội Tâm:</span>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed font-serif">
              {profile.innerConflict}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Xung đột giữa khát vọng cá nhân và trách nhiệm lịch sử tạo nên chiều sâu cảm xúc cho kịch bản.
            </p>
          </div>

          {/* Pillar 4: Fatal Flaw / Hubris */}
          <div className="rounded-xl bg-rose-950/20 border border-rose-900/50 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Tử Huyệt Định Mệnh / Ngạo Mạn (Hubris):</span>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed font-serif">
              {profile.fatalFlawOrHubris}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Mầm mống dẫn đến sự sụp đổ không thể vãn hồi ở Hồi 4 theo đúng quy luật kịch tính học cổ điển.
            </p>
          </div>
        </div>
      </div>

      {/* Visual & Cinematography Style */}
      {profile.visualStyle && (
        <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Phong Cách Thị Giác & Bút Pháp Điện Ảnh:</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
            {profile.visualStyle}
          </p>
        </div>
      )}

      {/* Production Package */}
      <div className="space-y-6 pt-4 border-t border-stone-800">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <span>Gói Sản Xuất & Tối Ưu Hóa Phân Phối (Production Package):</span>
        </h3>

        {/* Viral Titles */}
        <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-3">
          <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
            Gợi Ý Tiêu Đề YouTube / Video Triệu View (High CTR):
          </h4>
          <div className="space-y-2">
            {production.youtubeMetadata.viralTitles.map((title, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-700/60 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium text-stone-200 pr-2">
                  {i + 1}. {title}
                </span>
                <button
                  onClick={() => copyText(title, i)}
                  className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-900 shrink-0 transition-colors"
                >
                  {copiedTitleIndex === i ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedTitleIndex === i ? 'Đã chép' : 'Sao chép'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail Concepts */}
        <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-3">
          <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
            Ý Tưởng Thiết Kế Thumbnail Thu Hút:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {production.youtubeMetadata.thumbnailConcepts.map((concept, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                <span className="text-amber-400 font-bold block mb-1">Concept {i + 1}:</span>
                {concept}
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette & Music Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Palette */}
          <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              Bảng Màu Cảm Xúc Từng Hồi (Color Palette):
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              <div><strong className="text-amber-400">Hồi 1:</strong> {production.colorPalette.act1Color}</div>
              <div><strong className="text-orange-400">Hồi 2:</strong> {production.colorPalette.act2Color}</div>
              <div><strong className="text-yellow-400">Hồi 3:</strong> {production.colorPalette.act3Color}</div>
              <div><strong className="text-rose-400">Hồi 4:</strong> {production.colorPalette.act4Color}</div>
              <div className="pt-1 text-stone-400 border-t border-stone-800">
                <em>Tổng thể:</em> {production.colorPalette.overallMood}
              </div>
            </div>
          </div>

          {/* Music Recommendations */}
          <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-400" />
              Âm Hưởng Âm Nhạc & Nhịp Điệu (Soundscape):
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              <div><strong className="text-amber-300">Mở đầu (Act 1):</strong> {production.musicRecommendations.openingTrackMood}</div>
              <div><strong className="text-orange-300">Chiến trận (Act 2):</strong> {production.musicRecommendations.battleTrackMood}</div>
              <div><strong className="text-yellow-300">Cao trào (Act 3):</strong> {production.musicRecommendations.climaxTrackMood}</div>
              <div><strong className="text-rose-300">Bi kịch (Act 4):</strong> {production.musicRecommendations.tragicTrackMood}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
