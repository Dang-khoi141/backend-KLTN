export class ReviewableProductDto {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage?: string;
  deliveredAt: Date;
}
