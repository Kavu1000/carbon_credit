import './globals.css'

export const metadata = {
  title: 'CarbonLao — Transparent climate action',
  description: 'Transparent carbon credits for Laos',
}

export default function RootLayout({ children }) {
  return <html lang="en"><body className="min-h-screen bg-carbon-paper font-sans text-carbon-ink antialiased">{children}</body></html>
}
