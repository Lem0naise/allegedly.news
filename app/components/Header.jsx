export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <div className="title-with-icon">
            <img
              src="/icons/icon.webp"
              alt="Allegedly News Icon"
              className="site-icon"
            />
            <div className="title-text">
              <a href="/" className="site-title">
                Allegedly News
              </a>
              <p className="site-tagline">
                Reporting for the many, not the few
              </p>
            </div>
          </div>
        </div>
        <nav className="site-nav">
          <ul>
            <li>
              Made by <a href='https://indigo.spot' target="_blank">Indigo Nolan</a>
            </li>

          </ul>
        </nav>
      </div>
    </header>
  );
}
