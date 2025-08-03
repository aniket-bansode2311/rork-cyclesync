// Request queue to prevent too many concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3;
  private requestTimes: number[] = [];
  private maxRequestsPerMinute = 30;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Check rate limiting
          if (!this.canMakeRequest()) {
            const waitTime = this.getWaitTime();
            console.log(`Rate limiting: waiting ${waitTime}ms before request`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }

          this.recordRequest();
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    return this.requestTimes.length < this.maxRequestsPerMinute;
  }

  private getWaitTime(): number {
    if (this.requestTimes.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requestTimes);
    const timeToWait = 60000 - (Date.now() - oldestRequest);
    
    return Math.max(0, timeToWait);
  }

  private recordRequest(): void {
    this.requestTimes.push(Date.now());
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const requestFn = this.queue.shift();
    
    if (requestFn) {
      try {
        await requestFn();
      } catch (error) {
        console.error('Request queue error:', error);
      }
    }

    this.running--;
    
    // Process next request
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
}

export const requestQueue = new RequestQueue();