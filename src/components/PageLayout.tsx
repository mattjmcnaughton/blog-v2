import Header from "./Header";
import Footer from "./Footer";
import GradientOrbs from "./GradientOrbs";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      <GradientOrbs />
      <Header />
      <main
        className={`relative z-[1] mx-auto max-w-[1100px] px-4 pt-28 pb-16 sm:px-6 lg:px-8 ${className}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
