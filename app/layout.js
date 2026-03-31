import "./globals.css";

export const metadata = {
  title: "Allegedly News",
  description: "Reporting for the many, not the few",
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon32.ico", sizes: "32x32" },
    ],
    shortcut: "/icons/favicon.ico",
  },
  openGraph: {
    title: "Allegedly News",
    description: "Reporting for the many, not the few",
    siteName: "Allegedly News",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allegedly News",
    description: "Reporting for the many, not the few",
    site: "@AllegedlyNewsHq",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
