// gemini-proxy.mjs

// 直接使用 ES modules 导出语法，不需要 createRequire
export const handler = async (event) => {
  // 构建目标 URL
  const path = event.path.replace('/.netlify/functions/gemini-proxy', '')
  const targetUrl = `https://generativelanguage.googleapis.com${path}${event.rawQuery ? `?${event.rawQuery}` : ''}`

  try {
    // 创建请求头
    const headers = {}
    for (const [key, value] of Object.entries(event.headers)) {
      if (value && !['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    }

    // 发送代理请求
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: event.body,
    })

    // 获取响应头
    const responseHeaders = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // 返回响应
    return {
      statusCode: response.status,
      headers: {
        ...responseHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
      body: await response.text(),
    }
  } catch (error) {
    console.error('Proxy request error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: 'Proxy Error',
    }
  }
}
