import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile - CodingOH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
