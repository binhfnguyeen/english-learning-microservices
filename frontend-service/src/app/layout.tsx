import { Metadata } from "next";

export const metadata: Metadata = {
    title: "EngLearn",
    description: "Created by Heulwen",
    icons: {
        icon: "/template/EngLearnLogo.png",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                {children}
            </body>
        </html>
    );
}