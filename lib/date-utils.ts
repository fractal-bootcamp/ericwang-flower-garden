export function formatDistanceToNow(timestamp: number): string {
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""}`
    }
  
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`
    }
  
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`
    }
  
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""}`
    }
  
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""}`
    }
  
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""}`
  }
  
  