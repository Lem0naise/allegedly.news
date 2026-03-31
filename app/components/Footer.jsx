export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; {year} Allegedly News. All rights reserved.</p>

      </div>
    </footer>
  );
}
