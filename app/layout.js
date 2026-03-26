export const metadata = {
  title: "SkoolAPI Cloud — The Control Plane for Skool Operators",
  description: "Automate member onboarding, recover failed payments, sync to your CRM.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#09090b" }}>
        {children}
      </body>
    </html>
  )
}