"use client";

/**
 * PushNotificationCard — phone lock screen news alert replica
 */

const APP_COLORS = {
  "BBC News": "#BB1919",
  "The Guardian": "#052962",
  "Sky News": "#9E0000",
  "CNN": "#CC0000",
  "Reuters": "#FF8000",
  "NYT": "#121212",
  "Washington Post": "#1A1A1A",
  "Fox News": "#003366",
  "Al Jazeera": "#D2A44E",
  "Daily Mail": "#004DB3",
};

function getAppColor(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, color] of Object.entries(APP_COLORS)) {
    if (lower.includes(key.toLowerCase())) return color;
  }
  const hash = (name || "news").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallback = ["#1DA1F2", "#794BC4", "#E0245E", "#F45D22", "#17BF63", "#FFAD1F"];
  return fallback[hash % fallback.length];
}

export default function PushNotificationCard({ notification }) {
  if (!notification) return null;

  const appColor = getAppColor(notification.app_name);
  const initial = (notification.app_name || "N").charAt(0).toUpperCase();

  return (
    <div className="push-notif-card">
      {/* App icon + name + timestamp */}
      <div className="push-notif__header">
        <div className="push-notif__icon" style={{ backgroundColor: appColor }}>
          {initial}
        </div>
        <div className="push-notif__meta">
          <span className="push-notif__app-name">{notification.app_name}</span>
          {notification.timestamp && (
            <span className="push-notif__timestamp">{notification.timestamp}</span>
          )}
        </div>
      </div>

      {/* Headline */}
      <h3 className="push-notif__headline">{notification.headline}</h3>

      {/* Preview */}
      {notification.preview && (
        <p className="push-notif__preview">{notification.preview}</p>
      )}
    </div>
  );
}
