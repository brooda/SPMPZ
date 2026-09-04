export default function Home() {
  return (
    <main className="site-preview">
      <iframe
        className="site-preview__frame"
        src="/spmpz/index.html"
        title="SPMPZ — zielony i niebieski wariant strony"
      />
      <noscript>
        <p>
          <a href="/spmpz/index.html">Otwórz stronę SPMPZ</a>
        </p>
      </noscript>
    </main>
  );
}
