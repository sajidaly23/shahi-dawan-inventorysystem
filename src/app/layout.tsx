import type { Metadata } from 'next';
import './globals.css';
import { DbProvider } from '../context/DbContext';
import { ToastContainer } from '../components/common/ToastContainer';

export const metadata: Metadata = {
  title: 'Shahi Diwan Grand — Restaurant Inventory & Hotel Management ERP',
  description:
    'Full-stack enterprise restaurant inventory management, automated Recipe BOM ingredient consumption, live KDS, POS, and hotel folio billing.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d97706'><path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#090d16] text-slate-100 antialiased font-sans selection:bg-amber-500/30 selection:text-amber-200 min-h-screen">
        <DbProvider>
          {children}
          <ToastContainer />
        </DbProvider>
      </body>
    </html>
  );
}
