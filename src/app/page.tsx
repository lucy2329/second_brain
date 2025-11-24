export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Second Brain
        </h1>
        <p className="text-xl text-foreground/80">
          Your unified personal knowledge and productivity system
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-semibold">Coming Soon</p>
          </div>
        </div>
      </div>
    </main>
  );
}
