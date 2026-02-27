export async function fetchWithRetry(url, { retries = 2, baseDelayMs = 200, method = 'GET', body } = {}) {
    let attempt = 0

    while (true) {
      try {
        const isBodyDefined = body !== undefined && body !== null
        const parsedBody = isBodyDefined ? JSON.stringify(body) : undefined
        const res = await fetch(url, { signal: AbortSignal.timeout(2500), headers: {"Content-Type": "application/json"}, method, body: parsedBody })

        // Success
        if (res.ok) return res

        // Retry?
        const retryable = res.status >= 500 && res.status <= 599

        // Response not OK and no retry
        if (!retryable || attempt >= retries) {
          return res
        }

        // Retry logic
        const delay = baseDelayMs * Math.pow(2, attempt)
        attempt++
        await new Promise(r => setTimeout(r, delay))
      } catch(err) {
        // Network or timeout error
        if (attempt >= retries) throw err

        // Retry logic
        const delay = baseDelayMs * Math.pow(2, attempt)
        attempt++
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }