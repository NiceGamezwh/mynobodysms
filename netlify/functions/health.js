// netlify/functions/health.js
// 这是一个独立的 Netlify Function，用于提供健康检查。
// 在 Next.js App Router 中，通常由 app/api/health/route.ts 处理，
// 但作为备用或独立服务时可以使用此文件。

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // 允许所有来源进行 CORS 访问
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Netlify Function is running.",
      source: "netlify/functions/health.js",
    }),
  }
}
