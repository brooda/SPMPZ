import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPMPZ — Zamość bliżej Europy',
  description:
    'Dwa warianty nowej strony Stowarzyszenia Przyjaciół Miast Partnerskich Zamościa.',
  openGraph: {
    title: 'SPMPZ — Zamość bliżej Europy',
    description:
      'Porównaj zielony i niebieski wariant nowej strony stowarzyszenia.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'SPMPZ — Zamość bliżej Europy',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPMPZ — Zamość bliżej Europy',
    description:
      'Porównaj zielony i niebieski wariant nowej strony stowarzyszenia.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
