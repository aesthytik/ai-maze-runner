export const metadata = {
  title: "AI Maze Navigator",
  description: "A maze game controlled by AI chat commands",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
