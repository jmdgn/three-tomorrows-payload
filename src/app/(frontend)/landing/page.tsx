// app/(frontend)/landing/page.tsx
export const dynamic = 'force-static';

export default function LandingPage() {
  // This simplified page will only be used during build
  // At runtime, your actual page logic will execute
  return (
    <div>
      <header>Header Placeholder</header>
      <main>
        <h1>Landing Page</h1>
        <p>This is a build-time placeholder.</p>
      </main>
      <footer>Footer Placeholder</footer>
    </div>
  );
}