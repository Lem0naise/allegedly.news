export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; {year} Allegedly News. Made by <a href='https://indigo.spot' target="_blank">Indigo Nolan</a>.</p>

      </div>
    </footer>
  );
}
