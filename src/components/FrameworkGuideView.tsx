import React, { useState } from 'react';
import {
  BookOpen,
  Flame,
  ShieldAlert,
  Zap,
  Crown,
  EyeOff,
  Clock,
  Compass,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Mic,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MASTER_SIX_PARTS_CONFIG } from '../utils/pacing';

export const FrameworkGuideView: React.FC = () => {
  const [copiedPartKey, setCopiedPartKey] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<number | null>(null);

  const handleCopyFormula = (partKey: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPartKey(partKey);
    setTimeout(() => setCopiedPartKey(null), 2000);
  };

  const getPartIcon = (idx: number) => {
    switch (idx) {
      case 1:
        return Flame;
      case 2:
        return ShieldAlert;
      case 3:
        return Zap;
      case 4:
        return Crown;
      case 5:
        return EyeOff;
      case 6:
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  const getPartColorClasses = (idx: number) => {
    switch (idx) {
      case 1:
        return {
          border: 'border-amber-600/70',
          bg: 'bg-amber-950/40',
          badge: 'bg-amber-950 text-amber-300 border-amber-600/60',
          text: 'text-amber-400',
        };
      case 2:
        return {
          border: 'border-rose-600/70',
          bg: 'bg-rose-950/40',
          badge: 'bg-rose-950 text-rose-300 border-rose-600/60',
          text: 'text-rose-400',
        };
      case 3:
        return {
          border: 'border-orange-600/70',
          bg: 'bg-orange-950/40',
          badge: 'bg-orange-950 text-orange-300 border-orange-600/60',
          text: 'text-orange-400',
        };
      case 4:
        return {
          border: 'border-yellow-600/70',
          bg: 'bg-yellow-950/40',
          badge: 'bg-yellow-950 text-yellow-300 border-yellow-600/60',
          text: 'text-yellow-400',
        };
      case 5:
        return {
          border: 'border-purple-600/70',
          bg: 'bg-purple-950/40',
          badge: 'bg-purple-950 text-purple-300 border-purple-600/60',
          text: 'text-purple-400',
        };
      case 6:
        return {
          border: 'border-emerald-600/70',
          bg: 'bg-emerald-950/40',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
          text: 'text-emerald-400',
        };
      default:
        return {
          border: 'border-stone-700',
          bg: 'bg-stone-900',
          badge: 'bg-stone-800 text-stone-300 border-stone-600',
          text: 'text-amber-400',
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Framework Manifesto Header */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-800/80 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Khung Kịch Bản Chuẩn 6 Phần Chính (Master 6-Part Framework)
            </h2>
            <p className="text-xs text-stone-400">
              Cấu trúc tối ưu cho video tài liệu lịch sử chuyên nghiệp thời lượng 20 đến 35 phút (12 Phân Cảnh Chuẩn)
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-300 leading-relaxed font-serif">
          Khung kịch bản 6 Phần Chính là đỉnh cao của nghệ thuật kể chuyện tài liệu lịch sử hiện đại, kết hợp chặt chẽ giữa <strong>Chính sử uy tín</strong> và <strong>nghệ thuật dẫn dắt điện ảnh dồn dập</strong>. Khán giả không bị ru ngủ bởi tiểu sử ngày tháng khô khan, mà bị cuốn ngay vào nghịch lý chấn động, vết thương quá khứ, ván cược điên rồ, vinh quang tột đỉnh, điểm mù định mệnh và bài học nhân sinh vạn cổ.
        </p>

        {/* 6 Parts Default Timing Bar */}
        <div className="pt-3 border-t border-stone-800 space-y-2">
          <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Phân Bổ Thời Lượng Mặc Định Chuẩn 6 Phần (Tổng 34 phút = 2,040 giây @ 13 cps):</span>
            </span>
            <span className="text-stone-400">100% Khớp Ký Tự</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
            {MASTER_SIX_PARTS_CONFIG.map((cfg) => {
              const colors = getPartColorClasses(cfg.partIndex);
              return (
                <div
                  key={cfg.partIndex}
                  className={`p-2.5 rounded-xl border ${colors.border} ${colors.bg} space-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${colors.text}`}>P.{cfg.partIndex}</span>
                    <span className="text-[10px] text-stone-400">{cfg.durationPercentage}</span>
                  </div>
                  <div className="text-[11px] text-stone-200 font-sans font-semibold truncate">
                    {cfg.shortTitle.replace(/^[0-9]+\.\s*/, '')}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {cfg.defaultDurationText.split(' ')[0]} ({cfg.targetSeconds}s)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6 Main Parts In Full Detail */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
            <span>Chi Tiết Từng Phần, Mục Tiêu & Cấu Trúc Mẫu VO - Thoại</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">Mỗi phần gồm đúng 2 Phân cảnh ăn khớp</span>
        </div>

        {MASTER_SIX_PARTS_CONFIG.map((cfg) => {
          const Icon = getPartIcon(cfg.partIndex);
          const colors = getPartColorClasses(cfg.partIndex);
          const isCopied = copiedPartKey === cfg.partKey;
          const isExpanded = expandedPart === cfg.partIndex;

          const formulaText = `[${cfg.partTitle}] (${cfg.durationPercentage} video - ${cfg.defaultDurationText})
MỤC TIÊU: ${cfg.objective}

CẤU TRÚC MẪU:
- VO (${cfg.sampleStructure.voTone}):
${cfg.sampleStructure.voFormula}

- HỘI THOẠI (Dialogue):
${cfg.sampleStructure.dialogueFormula}

- VO KẾT:
${cfg.sampleStructure.outroVoFormula}`;

          return (
            <div
              key={cfg.partIndex}
              className={`rounded-2xl bg-stone-900/90 border ${colors.border} p-6 space-y-4 shadow-xl transition-all`}
            >
              {/* Part Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colors.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${colors.badge} font-bold`}>
                        PHẦN {cfg.partIndex}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {cfg.durationPercentage} video • {cfg.defaultDurationText} • Sc #{cfg.sceneNumbers[0]} & #{cfg.sceneNumbers[1]}
                      </span>
                    </div>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                      {cfg.partTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyFormula(cfg.partKey, formulaText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-mono transition-colors cursor-pointer"
                    title="Sao chép toàn bộ công thức mẫu của Phần này"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Đã sao chép' : 'Sao chép cấu trúc mẫu'}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPart(isExpanded ? null : cfg.partIndex)}
                    className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Objective */}
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  Mục tiêu trọng tâm:
                </span>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif pl-1">
                  {cfg.objective}
                </p>
              </div>

              {/* Sample Structure: VO & Dialogue */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cấu Trúc Mẫu Điển Hình (VO & Hội Thoại Sắc Lẹm):</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  {/* VO Intro */}
                  <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Mic className="w-3 h-3 text-amber-400" />
                      VO ({cfg.sampleStructure.voTone}):
                    </span>
                    <p className="text-stone-300 italic font-serif leading-relaxed pl-1">
                      "{cfg.sampleStructure.voFormula}"
                    </p>
                  </div>

                  {/* Dialogue */}
                  <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      HỘI THOẠI (Xúc Tác Nhân Vật Phụ & Nhân Vật Chính):
                    </span>
                    <p className="text-stone-200 font-serif leading-relaxed pl-1">
                      {cfg.sampleStructure.dialogueFormula}
                    </p>
                  </div>

                  {/* VO Outro */}
                  <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <Mic className="w-3 h-3 text-emerald-400" />
                      VO KẾT THÚC PHẦN (Dẫn Nhập Liền Mạch):
                    </span>
                    <p className="text-stone-300 italic font-serif leading-relaxed pl-1">
                      "{cfg.sampleStructure.outroVoFormula}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Scene Allocation Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/60 text-[11px] font-mono text-stone-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phân cảnh tương ứng: Sc #{cfg.sceneNumbers[0]} & Sc #{cfg.sceneNumbers[1]}</span>
                </span>
                <span className="text-amber-400">
                  Mục tiêu ký tự chuẩn: Sc #{cfg.sceneNumbers[0]} + Sc #{cfg.sceneNumbers[1]} = {cfg.targetSeconds * 13} ký tự (@13 cps)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 GOLDEN STORYTELLING & DIALOGUE CONSTRAINTS */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-600/50 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-stone-800 pb-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-200">
              5 Nguyên Tắc Kể Chuyện & Hội Thoại Bắt Buộc (Hard Constraints)
            </h3>
            <p className="text-xs text-stone-400">
              Quy chuẩn biên kịch phim tài liệu lịch sử đỉnh cao áp dụng xuyên suốt 6 Phần chính
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-600/40 flex items-center justify-center font-mono text-[10px]">1</span>
              <span>Tiến Trình Tuyến Tính 100%</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Bám sát tuyệt đối dòng thời gian cuộc đời nhân vật: <strong>Xuất thân $\rightarrow$ Bước ngoặt $\rightarrow$ Đỉnh cao $\rightarrow$ Sụp đổ / Kết thúc $\rightarrow$ Di sản</strong>. Không đảo lộn niên đại gây rối rắm.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-600/40 flex items-center justify-center font-mono text-[10px]">2</span>
              <span>Quy Luật Xúc Tác Của Nhân Vật Phụ</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Trong <strong>CẢ 12 CẢNH</strong>, bắt buộc phải có sự xuất hiện của các nhân vật phụ. Nhân vật phụ không làm nền mà là "chất xúc tác" — đưa ra thách thức, cám dỗ, mưu đồ hoặc đe dọa, trực tiếp đẩy nhân vật chính đến ngã rẽ cuộc đời.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-600/40 flex items-center justify-center font-mono text-[10px]">3</span>
              <span>Nghệ Thuật Xen Kẽ Âm Thanh (VO & Dialogue)</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Lồng ghép nhịp nhàng giữa <strong>Lời bình (VO)</strong> hùng hồn/chiều sâu của Narrator và <strong>Hội thoại trực tiếp (Dialogue)</strong> sắc bén, kịch tính giữa nhân vật chính và nhân vật phụ.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-600/40 flex items-center justify-center font-mono text-[10px]">4</span>
              <span>Chính Sử Uy Tín 100% (Không Dã Sử Lai Căng)</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Tất cả sự kiện, danh xưng, niên đại, trận đánh phải dựa trên các bộ chính sử kinh điển (Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục, Sử Ký Tư Mã Thiên, Hán Thư...).
            </p>
          </div>
        </div>

        {/* 10 Pronoun Layers */}
        <div className="p-4 rounded-xl bg-stone-950 border border-amber-700/40 space-y-3 text-xs">
          <div className="font-bold text-amber-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>5. Quy Tắc Xưng Hô Đa Tầng (10 Yếu Tố Chân Thực Tuyệt Đối):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px] text-stone-300 font-sans">
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">1. Quan hệ nền tảng</strong>
              <span>Quân-thần, cha-con, phu-thê, chủ-tớ...</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">2. Khoảng cách tuổi tác</strong>
              <span>Kính trọng bề trên, bao dung kẻ dưới</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">3. Mức độ thân mật</strong>
              <span>Khách sáo lúc đầu, ruột thịt khi tâm giao</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">4. Sự leo thang / rạn nứt</strong>
              <span>Ái khanh/trẫm $\rightarrow$ Ngươi/ta khi phẫn nộ</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">5. Bước ngoặt tình cảm</strong>
              <span>Từ ân tình sang tuyệt tình đoạn nghĩa</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">6. Không gian quyền lực</strong>
              <span>Triều đình uy nghiêm vs phòng kín mật thất</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">7. Bối cảnh thời đại</strong>
              <span>Từ vựng phong kiến triều đại tương ứng</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">8. Đặc trưng vùng miền</strong>
              <span>Khí chất văn hóa nơi nhân vật lớn lên</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">9. Cá tính cốt lõi</strong>
              <span>Ngạo mạn trịch thượng vs khiêm nhường</span>
            </div>
            <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
              <strong className="text-amber-300 block mb-0.5">10. Bối cảnh xuất thân</strong>
              <span>Quý tộc vs thương nhân, bần nông</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Directing Tips */}
      <div className="rounded-xl bg-amber-950/30 border border-amber-700/50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Bí Kíp Vàng Của Đạo Diễn & Chuyên Gia Biên Kịch:</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed font-serif">
          Khi chọn bất kỳ nhân vật lịch sử nào (như Quang Trung, Tào Tháo, Lã Bất Vi, Võ Tắc Thiên, Hàn Tín...), bạn chỉ cần gắp các sự kiện lịch sử của họ thả vào đúng <strong>6 Phần Chính</strong> của bộ khung này. Mỗi phần phụ trách 2 phân cảnh ăn khớp hoàn hảo với nhịp điệu và tâm lý nhân vật, mang lại trải nghiệm xem tài liệu đỉnh cao cuốn hút từ giây đầu đến phút cuối.
        </p>
      </div>
    </div>
  );
};
