/**
 * Simple Token Bucket Rate Limiter
 * Limits chatbot requests to prevent hitting Google API quotas
 */
class RateLimiter {
    constructor(maxTokens = 10, refillRate = 1, refillInterval = 60000) {
        this.maxTokens = maxTokens; // Max requests in bucket
        this.tokens = maxTokens; // Current available tokens
        this.refillRate = refillRate; // Tokens to add per interval
        this.refillInterval = refillInterval; // Interval in ms (default: 1 minute)
        this.queue = [];

        // Start refill timer
        setInterval(() => this.refill(), this.refillInterval);
    }

    refill() {
        this.tokens = Math.min(this.maxTokens, this.tokens + this.refillRate);
        this.processQueue();
    }

    async acquire() {
        return new Promise((resolve, reject) => {
            if (this.tokens > 0) {
                this.tokens--;
                resolve();
            } else {
                // Queue the request
                this.queue.push({ resolve, reject, timestamp: Date.now() });

                // Set timeout to reject if waiting too long (2 minutes)
                setTimeout(() => {
                    const index = this.queue.findIndex(item => item.resolve === resolve);
                    if (index !== -1) {
                        this.queue.splice(index, 1);
                        reject(new Error('Rate limit timeout - too many requests'));
                    }
                }, 120000);
            }
        });
    }

    processQueue() {
        while (this.queue.length > 0 && this.tokens > 0) {
            const { resolve } = this.queue.shift();
            this.tokens--;
            resolve();
        }
    }

    getStatus() {
        return {
            availableTokens: this.tokens,
            maxTokens: this.maxTokens,
            queueLength: this.queue.length
        };
    }
}

// Create a rate limiter: 10 requests per minute
const chatbotRateLimiter = new RateLimiter(10, 10, 60000);

module.exports = { chatbotRateLimiter };
