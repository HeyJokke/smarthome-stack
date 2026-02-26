export async function fetchWithRetry(url, { retries = 2, baseDelayMs = 200 } = {}) {
    let attempt = 0

    while (true) {
        try {
            const res = await fetch(url, AbortSignal.timeout(2500))

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
            // Network failure or timeout error
            if (attempt >= retries) throw err

            // Retry logic
            const delay = baseDelayMs * Math.pow(2, attempt)
            attempt++
            await new Promise(r => setTimeout(r, delay))
        }
    }
}