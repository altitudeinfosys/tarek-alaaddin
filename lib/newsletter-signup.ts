const SUBSCRIBED_KEY = 'newsletter-popup-subscribed'

export const SUBSCRIBED_EVENT = 'newsletter:subscribed'
export const POPUP_VISIBILITY_EVENT = 'newsletter:popup-visibility'

export function isSubscribed(): boolean {
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === 'true'
  } catch {
    return false
  }
}

export function markSubscribed() {
  try {
    localStorage.setItem(SUBSCRIBED_KEY, 'true')
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(new Event(SUBSCRIBED_EVENT))
}
