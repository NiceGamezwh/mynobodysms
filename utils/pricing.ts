// 价格计算工具函数
export const PRICE_MULTIPLIER = 3 // 3倍价格显示

export interface ProjectPricing {
  regular: number // 普通项目价格（椰子云实际价格 * 3）
  exclusive?: number // 专属项目价格（如果有的话）
}

// 椰子云实际价格配置
export const COCONUT_PRICES = {
  regular: 0.1, // 普通项目实际价格0.1元
  // 专属项目价格需要通过API获取或配置
}

// 显示价格（实际价格 * 3）
export const DISPLAY_PRICES = {
  regular: COCONUT_PRICES.regular * PRICE_MULTIPLIER, // 0.3元
}

// 格式化价格显示
export function formatPrice(actualPrice: number): string {
  const displayPrice = actualPrice * PRICE_MULTIPLIER
  return `¥${displayPrice.toFixed(2)}`
}

// 格式化余额显示（实际余额 * 3）
export function formatBalance(actualBalance: string | number): string {
  const balance = typeof actualBalance === "string" ? Number.parseFloat(actualBalance) : actualBalance
  const displayBalance = balance * PRICE_MULTIPLIER
  return `¥${displayBalance.toFixed(2)}`
}

// 获取项目价格信息
export function getProjectPrice(projectId: string, isExclusive = false): number {
  if (isExclusive) {
    // 专属项目价格可能需要通过API获取，这里先返回默认值
    // 实际使用时可以根据projectId查询具体价格
    return DISPLAY_PRICES.regular // 临时返回普通价格的3倍
  }
  return DISPLAY_PRICES.regular
}
