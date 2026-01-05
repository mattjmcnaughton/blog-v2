export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} mattjmcnaughton. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
