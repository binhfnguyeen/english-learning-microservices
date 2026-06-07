import { Metadata } from "next";
// @ts-ignore: CSS module declarations missing for bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
// @ts-ignore: CSS module declarations missing for globals.css
import "./globals.css";

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
