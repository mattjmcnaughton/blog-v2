import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-300 dark:bg-gray-900">
      <Header />
      <main
        className={`mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8 ${className}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
