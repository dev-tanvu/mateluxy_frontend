import type { Metadata } from "next";
import { Outfit, Source_Sans_3, Montserrat, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

const sourceSans = Source_Sans_3({
    subsets: ["latin"],
    variable: "--font-source-sans",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
    title: "Mateluxy CRM",
    description: "Real-estate CRM",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${sourceSans.variable} ${outfit.variable} ${montserrat.variable} ${poppins.variable} ${plusJakartaSans.variable} font-sans`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
