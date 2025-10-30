export const trackCheckoutEvent = (eventName, payload = {}) => {
  try {
    console.log(`[checkout] ${eventName}`, payload);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to track checkout event', eventName, error);
    }
  }
};

export default trackCheckoutEvent;
