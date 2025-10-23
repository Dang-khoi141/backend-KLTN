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
            content:
              'Bạn là trợ lý AI của website bán hàng, giúp gợi ý sản phẩm và mã khuyến mãi. Luôn trả lời bằng tiếng Việt. Nếu người dùng hỏi về sản phẩm, hãy dùng searchProducts; nếu hỏi về khuyến mãi, hãy dùng searchPromotions.',
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

      const keyword = extractKeyword(message);
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
    const query: Partial<ProductQueryDto> = {
      search: args.keyword ?? '',
      maxPrice: args.maxPrice as any,
      page: 1 as any,
      limit: args.limit ?? 10,
      isActive: true as any,
    };

    const result = await this.productService.search(query as ProductQueryDto);

    if (!result?.data?.length) {
      return {
        reply: `Không tìm thấy sản phẩm nào phù hợp với “${args.keyword ?? ''}”.`,
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
}

function safeJsonParse(input?: string) {
  try {
    return input ? JSON.parse(input) : {};
  } catch {
    return {};
  }
}

function extractKeyword(msg: string) {
  const match = msg.match(/tìm\s+(.*)/i);
  return match ? match[1].trim() : null;
}
