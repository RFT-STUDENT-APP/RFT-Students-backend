export async function sendExpoPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  if (!token || !token.startsWith('ExponentPushToken')) {
    return;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.warn('Failed to send Expo Push Notification:', err);
  }
}
