import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ProductService } from '../catalog/services/product.service';
import { ProductQueryDto } from '../catalog/dto/product-query.dto';
import { PromotionService } from '../promotion/promotion.service';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly productService: ProductService,
    private readonly promotionService: PromotionService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async handleQuery(message: string) {
    try {
      const bannedKeywords = [
        'chính trị',
        'vũ trụ',
        'toán',
        'code',
        'lập trình',
        'chatgpt',
        'openai',
        'youtube',
        'facebook',
        'ai là gì',
        'tin tức',
        'tình yêu',
        'phim',
        'ca sĩ',
      ];
      if (bannedKeywords.some((kw) => message.toLowerCase().includes(kw))) {
        return {
          reply:
            'Xin lỗi, tôi chỉ hỗ trợ thông tin về sản phẩm và khuyến mãi của cửa hàng thôi ạ.',
          products: [],
        };
      }
      if (
        /(giỏ hàng|đơn hàng|cart|hàng của tôi|đặt hàng của tôi)/i.test(message)
      ) {
        return {
          reply:
            'Giỏ hàng của bạn hiện không được hiển thị trong khung chat ạ 🛒.\nBạn có thể nhấn vào biểu tượng “🛍️ Giỏ hàng” ở góc trên cùng bên phải website để xem hoặc chỉnh sửa sản phẩm nhé!',
          products: [],
        };
      }

      if (
        /(tài khoản|đăng nhập|đăng xuất|đổi mật khẩu|profile|account)/i.test(
          message,
        )
      ) {
        return {
          reply:
            'Bạn có thể quản lý tài khoản hoặc đăng nhập bằng cách nhấn vào biểu tượng “👤 Tài khoản” ở góc trên cùng bên phải trang web nhé!',
          products: [],
        };
      }
      if (
        /(bạn là ai|mày là ai|ai đang nói chuyện|ai vậy|mày tên gì|mày là gì|xin chào|chào bạn|chào|hello|hi|hey|helo|alo|good morning|good afternoon|good evening)/i.test(
          message,
        )
      ) {
        return {
          reply:
            'Tôi là trợ lý ảo của website FreshFood 🌱. Tôi có thể giúp bạn tìm kiếm sản phẩm, tra cứu khuyến mãi và mã giảm giá của cửa hàng ạ!',
          products: [],
        };
      }

      if (/bao nhiêu sản phẩm|tổng sản phẩm/i.test(message)) {
        const count = await this.productService.countActive();
        return {
          reply: `Hiện tại cửa hàng đang có khoảng ${count} sản phẩm khác nhau, bao gồm thực phẩm, đồ uống và hàng tiêu dùng ạ 🛒`,
          products: [],
        };
      }
      const categoryMap: Record<string, string> = {
        mì: 'Mì ăn liền',
        'mì tôm': 'Mì ăn liền',
        'mì gói': 'Mì ăn liền',
        'mì ly': 'Mì ăn liền',
        'mì ăn liền': 'Mì ăn liền',
        rau: 'Rau củ quả',
        'rau củ': 'Rau củ quả',
        'rau quả': 'Rau củ quả',
        'trái cây': 'Trái cây',
        'hoa quả': 'Trái cây',
        thịt: 'Thịt tươi',
        'thịt tươi': 'Thịt tươi',
        'hải sản': 'Hải sản',
        cá: 'Hải sản',
        tôm: 'Hải sản',
        trứng: 'Trứng',
        gạo: 'Gạo & Hạt',
        'gạo & hạt': 'Gạo & Hạt',
        bánh: 'Bánh kẹo',
        kẹo: 'Bánh kẹo',
        'nước ngọt': 'Nước ngọt có ga',
        'nước suối': 'Nước suối',
        'nước trái cây': 'Nước trái cây',
        'nước chấm': 'Nước chấm',
        'nước rửa chén': 'Nước rửa chén',
        'bột giặt': 'Bột giặt',
        'nước xả': 'Nước xả vải',
        'nước tăng lực': 'Nước tăng lực',
        sữa: 'Sữa tươi & Sữa chua',
        'sữa tươi': 'Sữa tươi & Sữa chua',
        'sữa chua': 'Sữa tươi & Sữa chua',
        'sữa bột': 'Sữa bột',
        tã: 'Tã giấy',
        'tã giấy': 'Tã giấy',
        'gia vị': 'Gia vị nấu ăn',
        'nước mắm': 'Gia vị nấu ăn',
        muối: 'Đường & Muối',
        đường: 'Đường & Muối',
        'cà phê': 'Cà phê',
        trà: 'Trà & Trà túi lọc',
        'xúc xích': 'Xúc xích & Chế biến',
        'chế biến': 'Xúc xích & Chế biến',
      };
      const foundCategory = Object.keys(categoryMap).find((key) =>
        message.toLowerCase().includes(key.toLowerCase()),
      );
      if (foundCategory) {
        const categoryName = categoryMap[foundCategory];
        this.logger.log(`📦 Người dùng hỏi danh mục: ${categoryName}`);
        return this.handleSearchProducts({ keyword: categoryName });
      }
      const priceMatch = message.match(
        /(\d+(\.\d+)?)(\s?)(k|nghìn|ngàn|triệu|đ|vnđ)?/i,
      );
      let maxPrice: number | undefined;
      if (priceMatch) {
        const value = parseFloat(priceMatch[1]);
        if (!isNaN(value)) {
          if (/triệu/i.test(priceMatch[0])) maxPrice = value * 1_000_000;
          else if (/k|nghìn|ngàn/i.test(priceMatch[0]))
            maxPrice = value * 1_000;
          else if (/đ|vnđ/i.test(priceMatch[0])) maxPrice = value;
          else if (value < 1000) maxPrice = value * 1000;
        }
      }
      if (
        /(dưới|tầm|khoảng|đổ lại|không quá|<=|ít hơn)/i.test(message) &&
        maxPrice
      ) {
        const keyword = extractKeyword(message);
        this.logger.log(`🔍 Tìm sản phẩm "${keyword}" với giá <= ${maxPrice}`);
        return this.handleSearchProducts({ keyword, maxPrice });
      }
      if (/sản phẩm.*oce/i.test(message)) {
        return this.handleSearchProducts({ keyword: 'OCE' });
      }

      if (/ăn sáng|ăn trưa|ăn tối|món ngon/i.test(message)) {
        return this.handleSearchProducts({ keyword: 'thực phẩm' });
      }
      const bannedProductKeywords = [
        'quần áo',
        'áo sơ mi',
        'váy',
        'đầm',
        'quần jean',
        'áo khoác',
        'quần short',
        'giày',
        'dép',
        'túi xách',
        'balo',
        'mũ',
        'nón',
        'nước hoa',
        'mỹ phẩm',
        'son môi',
        'kem dưỡng',
        'kem chống nắng',
        'serum',
        'phấn trang điểm',
        'nước tẩy trang',
        'sữa rửa mặt',
        'sữa tắm',
        'dầu gội',
        'dầu xả',

        'tivi',
        'máy giặt',
        'tủ lạnh',
        'điện thoại',
        'máy tính',
        'ipad',
        'laptop',
        'loa',
        'tai nghe',
        'quạt điện',

        'bột giặt',
        'nước rửa chén',
        'nước lau sàn',
        'xà phòng giặt',

        'bàn',
        'ghế',
        'tủ',
        'nệm',
        'chăn',
        'ga giường',
        'màn cửa',
      ];

      if (
        bannedProductKeywords.some((kw) => message.toLowerCase().includes(kw))
      ) {
        return {
          reply:
            'Xin lỗi, cửa hàng FreshFood hiện chỉ bán thực phẩm, đồ uống và hàng tiêu dùng thôi ạ 🛒',
          products: [],
        };
      }

      if (
        /(thiếu|bổ sung|đau|mỏi|mệt|giảm cân|tăng cân|tăng cơ|sức khỏe|bệnh|canxi|vitamin|protein|tóc rụng|da khô|mắt kém|xương yếu|ăn kiêng|tim mạch|huyết áp)/i.test(
          message,
        )
      ) {
        return this.handleHealthAdvice(message);
      }

      const tools = [
        {
          type: 'function' as const,
          function: {
            name: 'searchProducts',
            description:
              'Tìm sản phẩm trong cơ sở dữ liệu dựa trên mô tả hoặc giá.',
            parameters: {
              type: 'object',
              properties: {
                keyword: {
                  type: 'string',
                  description: 'Tên hoặc mô tả sản phẩm',
                },
                maxPrice: { type: 'number', description: 'Giá tối đa (VND)' },
                limit: {
                  type: 'number',
                  description: 'Số lượng sản phẩm trả về',
                },
              },
              required: ['keyword'],
            },
          },
        },
        {
          type: 'function' as const,
          function: {
            name: 'searchPromotions',
            description: 'Liệt kê các mã khuyến mãi đang hoạt động.',
            parameters: { type: 'object', properties: {} },
          },
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
Bạn là trợ lý AI của website bán hàng FreshFood.
Bạn chỉ hỗ trợ khách hàng:
- Tìm kiếm sản phẩm (thực phẩm, đồ uống, nhu yếu phẩm, đồ gia dụng)
- Gợi ý sản phẩm, khuyến mãi và mã giảm giá
- Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện.

⚠️ Nếu người dùng hỏi ngoài phạm vi (ví dụ: chính trị, học tập, game, vũ trụ,...),
hãy trả lời đúng một câu duy nhất:
"Xin lỗi, tôi chỉ hỗ trợ thông tin về sản phẩm và khuyến mãi của cửa hàng thôi ạ."
          `,
          },
          { role: 'user', content: message },
        ],
        tools,
        tool_choice: 'auto',
      });

      const msg = completion.choices[0]?.message;

      if (msg?.tool_calls?.length) {
        for (const call of msg.tool_calls) {
          const fnName = (call as any).function?.name;
          const args = safeJsonParse((call as any).function?.arguments);

          if (fnName === 'searchProducts')
            return this.handleSearchProducts(args);
          if (fnName === 'searchPromotions')
            return this.handleSearchPromotions();
        }
      }

      if (/hôm\s*nay|có\s*gì|liệt\s*kê|show|mới/i.test(message)) {
        this.logger.log('📦 Người dùng muốn xem danh sách sản phẩm mới nhất');
        return this.handleLatestProducts();
      }

      if (/mã|khuyến mãi|giảm giá|voucher/i.test(message)) {
        return this.handleSearchPromotions();
      }

      const keyword = extractKeyword(message) || message.trim();
      const matchCategoryType = message.match(/c(á|a)c loại\s+(.+)/i);
      if (matchCategoryType) {
        const keyword = matchCategoryType[2].trim();
        this.logger.log(`🔍 Người dùng hỏi các loại: ${keyword}`);
        return this.handleSearchProducts({ keyword });
      }
      if (keyword) {
        this.logger.log(`🔍 Người dùng muốn tìm sản phẩm: ${keyword}`);
        return this.handleSearchProducts({ keyword });
      }

      return {
        reply:
          msg?.content?.trim() ||
          'Mình chưa hiểu rõ yêu cầu của bạn, bạn có thể mô tả sản phẩm muốn tìm (tên, khoảng giá, màu) không?',
        products: [],
      };
    } catch (error) {
      this.logger.error('❌ Lỗi khi gọi OpenAI:', error);
      return {
        reply:
          'Xin lỗi, hệ thống đang quá tải hoặc lỗi kết nối với OpenAI. Bạn thử lại sau nhé.',
        products: [],
      };
    }
  }

  private async handleSearchProducts(args: {
    keyword?: string;
    maxPrice?: number;
    limit?: number;
  }) {
    const keyword = args.keyword?.trim() ?? '';
    if (!keyword) {
      return {
        reply: 'Bạn vui lòng nhập tên sản phẩm cần tìm nhé 💬',
        products: [],
      };
    }

    const query: Partial<ProductQueryDto> = {
      search: keyword,
      maxPrice: args.maxPrice as any,
      page: 1 as any,
      limit: args.limit ?? 10,
      isActive: true as any,
    };

    const result = await this.productService.search(query as ProductQueryDto);

    if (!result?.data?.length) {
      return {
        reply: `Mình chưa thấy sản phẩm nào khớp với “${keyword}” cả 😅. Có thể bạn thử gõ rõ hơn tên sản phẩm hoặc chọn danh mục gần giống nhé!`,
        products: [],
      };
    }

    const lines = result.data.map(
      (p) => `• ${p.name} — ${Number(p.price ?? 0).toLocaleString('vi-VN')}đ`,
    );

    return {
      reply: `Mình gợi ý một vài sản phẩm phù hợp:\n${lines.join('\n')}`,
      products: result.data,
    };
  }

  private async handleLatestProducts() {
    const result = await this.productService.search({
      search: '',
      limit: 10,
      page: 1 as any,
      isActive: true as any,
    } as ProductQueryDto);

    if (!result?.data?.length) {
      return {
        reply: 'Hiện tại chưa có sản phẩm nào được cập nhật.',
        products: [],
      };
    }

    const lines = result.data.map(
      (p) => `• ${p.name} — ${Number(p.price ?? 0).toLocaleString('vi-VN')}đ`,
    );

    return {
      reply: `Các sản phẩm mới nhất hôm nay:\n${lines.join('\n')}`,
      products: result.data,
    };
  }

  private async handleSearchPromotions() {
    const promos = await this.promotionService.getActivePromotions();

    if (!promos.length) {
      return {
        reply: 'Hiện tại không có mã khuyến mãi nào đang hoạt động.',
        promotions: [],
      };
    }

    const lines = promos.map(
      (p) =>
        `• ${p.code} — ${p.description || 'Không có mô tả'} (${
          p.discountPercent
            ? p.discountPercent + '%'
            : p.discountAmount
              ? p.discountAmount.toLocaleString('vi-VN') + 'đ'
              : ''
        })`,
    );

    return {
      reply: `Các mã khuyến mãi đang hoạt động:\n${lines.join('\n')}`,
      promotions: promos,
    };
  }

  private async handleHealthAdvice(message: string) {
    this.logger.log('🩺 Phát hiện người dùng cần tư vấn sức khỏe: ' + message);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
Bạn là chuyên gia dinh dưỡng của siêu thị FreshFood 🩺.
Nhiệm vụ:
1️⃣ Đọc tình trạng sức khỏe người dùng.
2️⃣ Tư vấn ngắn gọn (1–3 câu) bằng tiếng Việt.
3️⃣ Gợi ý nhóm sản phẩm nên dùng (ví dụ: "thịt tươi", "rau củ quả", "sữa bột", "ngũ cốc", "nước trái cây", "thực phẩm bổ sung").
4️⃣ Trả về JSON:
{
  "advice": "Giải thích ngắn gọn bằng tiếng Việt",
  "category": "rau củ quả"
}
        `,
        },
        { role: 'user', content: message },
      ],
    });

    let category = 'thực phẩm bổ sung';
    let advice =
      'Bạn nên bổ sung thêm thực phẩm giàu dinh dưỡng để cải thiện sức khỏe 💪';

    try {
      const raw = completion.choices[0]?.message?.content;
      const parsed = JSON.parse(raw || '{}');
      category = parsed.category || category;
      advice = parsed.advice || advice;
    } catch (e) {
      this.logger.warn('⚠️ Không parse được phản hồi tư vấn sức khỏe:', e);
    }

    const healthCategoryMap: Record<string, string> = {
      'sữa tươi': 'Sữa tươi & Sữa chua',
      'sữa bột': 'Sữa bột',
      vitamin: 'Thực phẩm bổ sung',
      'thực phẩm bổ sung': 'Thực phẩm bổ sung',
      'rau củ quả': 'Rau củ quả',
      'trái cây': 'Trái cây',
      'nước ép': 'Nước trái cây',
      'ngũ cốc': 'Gạo & Hạt',
      'hải sản': 'Hải sản',
      thịt: 'Thịt tươi',
      trứng: 'Trứng',
      đậu: 'Đậu nành & Tàu hủ',
      'nước uống': 'Nước suối',
      'đồ uống dinh dưỡng': 'Nước trái cây',
    };

    const mappedCategory =
      healthCategoryMap[category.toLowerCase()] || category;

    this.logger.log(
      `💡 AI gợi ý danh mục dinh dưỡng: ${category} → map tới: ${mappedCategory}`,
    );

    const result = await this.handleSearchProducts({ keyword: mappedCategory });

    if (!result.products?.length) {
      return {
        reply: `${advice}\n\nHiện tại FreshFood chưa có sản phẩm phù hợp cho nhóm “${mappedCategory}”, bạn có thể tham khảo thêm ý kiến bác sĩ hoặc chuyên gia dinh dưỡng nhé 🩺`,
        products: [],
      };
    }

    return {
      reply: `${advice}\n\nMình gợi ý thêm vài sản phẩm phù hợp mà bạn có thể mua tại FreshFood 🛒:\n${result.reply.replace('Mình gợi ý một vài sản phẩm phù hợp:\n', '')}`,
      products: result.products,
    };
  }
}

function safeJsonParse(input?: string) {
  try {
    return input ? JSON.parse(input) : {};
  } catch {
    return {};
  }
}

function extractKeyword(msg: string) {
  msg = msg.toLowerCase().trim();

  const patterns = [
    /tìm\s+(.*)/i,
    /mua\s+(.*)/i,
    /c(á|a)c loại\s+(.*)/i,
    /loại\s+(.*)/i,
    /sản phẩm\s+(.*)/i,
    /có\s+(.*)\s+không/i,
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match) {
      return match[match.length - 1].trim();
    }
  }

  return msg
    .replace(/^(tôi|muốn|mua|tìm|cần|cho|bán|có|loại|ai|đang)\s+/gi, '')
    .trim();
}
