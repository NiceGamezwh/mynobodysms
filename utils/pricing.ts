// utils/pricing.ts
// 这是一个示例文件，用于处理定价逻辑。
// 在实际应用中，这可能涉及从 API 获取数据或更复杂的计算。

interface PricingItem {
  id: string
  name: string
  price: string // 价格字符串，例如 "0.50"
  currency?: string // 货币单位，例如 "USD"
  description?: string
}

export function formatPrice(price: string, currency = "¥"): string {
  // 格式化价格，确保两位小数
  const formattedPrice = Number.parseFloat(price).toFixed(2)
  return `${currency} ${formattedPrice}`
}

export function getPricingDetails(pricingData: PricingItem[]): string {
  if (!pricingData || pricingData.length === 0) {
    return "暂无定价信息。"
  }
  return pricingData.map((item) => `${item.name}: ${formatPrice(item.price)}`).join(", ")
}
