import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { CustomCursor } from "@/components/CustomCursor";
import { site } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/opengraph-image", alt: `${site.name} portfolio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#131311" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      // The theme script below may set data-theme before React hydrates
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain min-h-full font-sans text-ink">
        <div className="flex min-h-screen">
          <Sidebar />
          {children}
        </div>
        <CustomCursor />
      </body>
    </html>
  );
}
