exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  }

  // 处理 OPTIONS 请求
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    }
  }

  // 处理 GET 请求
  if (event.httpMethod === "GET") {
    try {
      const response = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        service: "NobodySMS",
        platform: "netlify-functions",
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response),
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: "unhealthy",
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      }
    }
  }

  // 不支持的方法
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: "Method Not Allowed" }),
  }
}
