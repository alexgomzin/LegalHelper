export const GA_TRACKING_ID = 'G-663DMJSLEN'

// Log specific events happening
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track conversion events
export const trackConversion = (conversionName: string, additionalParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: GA_TRACKING_ID,
      event_category: 'conversion',
      event_label: conversionName,
      ...additionalParams
    })
  }
}

// Specific conversion tracking functions
export const trackGetStartedClick = () => {
  trackConversion('get_started_click', {
    event_category: 'user_engagement',
    event_label: 'get_started_button'
  })
}

export const trackSignUpClick = () => {
  trackConversion('sign_up_click', {
    event_category: 'user_engagement', 
    event_label: 'sign_up_button'
  })
}

export const trackPdfSelectClick = () => {
  trackConversion('pdf_select_click', {
    event_category: 'user_engagement',
    event_label: 'select_pdf_button'
  })
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
} 