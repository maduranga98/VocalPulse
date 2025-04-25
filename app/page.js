import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12 flex flex-col">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-6">
        <div className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js Logo"
            width={100}
            height={24}
            priority
          />
        </div>
        <nav className="hidden sm:flex gap-8">
          <a
            href="#"
            className="text-sm hover:text-primary-hover transition-colors"
          >
            Docs
          </a>
          <a
            href="#"
            className="text-sm hover:text-primary-hover transition-colors"
          >
            Examples
          </a>
          <a
            href="#"
            className="text-sm hover:text-primary-hover transition-colors"
          >
            Learn
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto gap-12 py-12">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              VocalPulse
            </span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            A modern call center management platform built with Next.js and
            Firebase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white bg-opacity-70 dark:bg-card hover:bg-card-hover border border-border rounded-lg p-8 transition-all hover:shadow-lg">
            <h2 className="text-xl font-medium mb-4">Getting Started</h2>
            <p className="text-muted mb-4">
              Edit <code>app/page.js</code> to get started with your
              application.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-primary hover:text-primary-hover"
            >
              Read the docs →
            </a>
          </div>

          <div className="bg-white bg-opacity-70 dark:bg-card hover:bg-card-hover border border-border rounded-lg p-8 transition-all hover:shadow-lg">
            <h2 className="text-xl font-medium mb-4">Deploy Now</h2>
            <p className="text-muted mb-4">
              Deploy your Next.js site to Vercel with a few clicks.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-primary hover:text-primary-hover"
            >
              Deploy now →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-border py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © 2025 VocalPulse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted hover:text-primary-hover transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-muted hover:text-primary-hover transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-muted hover:text-primary-hover transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
