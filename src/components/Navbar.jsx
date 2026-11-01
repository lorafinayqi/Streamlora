import { Link } from "react-router-dom";

function Navbar({ search, setSearch }) {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white/95 px-4 py-3 shadow-lg shadow-pink-100/50 backdrop-blur-xl sm:flex-nowrap sm:px-6">

        {/* LOGO */}
        <Link
          to="/"
          className="shrink-0 text-2xl font-black tracking-tight sm:text-3xl"
        >
          <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
            YZ
          </span>
          <span className="text-[#493545]">Project</span>
          <span className="ml-1 text-pink-400">♡</span>
        </Link>

        {/* MENU */}
        <div className="order-3 flex w-full items-center justify-center gap-2 sm:order-2 sm:w-auto sm:gap-3">

          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2.5 text-sm font-bold text-pink-600 transition hover:bg-pink-500 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9v12h14V9" />
              <path d="M9 21v-8h6v8" />
            </svg>
            Home
          </Link>

          <Link
            to="/#latest"
            className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2.5 text-sm font-bold text-pink-600 transition hover:bg-pink-500 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4.5 0 8-3.5 8-8-1-3-3-5-4-7-1 3-3 4-3 4s-1-5-5-8c0 5-4 7-4 12 0 4 3.5 7 8 7Z" />
            </svg>
            Latest
          </Link>

          <Link
            to="/#popular"
            className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2.5 text-sm font-bold text-pink-600 transition hover:bg-pink-500 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
            </svg>
            Popular
          </Link>
        </div>

        {/* SEARCH */}
        <div className="order-2 flex w-full items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2.5 text-pink-500 transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 sm:order-3 sm:w-48">

          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="search"
            placeholder="Cari anime..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full min-w-0 bg-transparent text-sm font-semibold text-pink-700 outline-none placeholder:text-pink-300"
          />
        </div>

      </nav>
    </header>
  );
}

export default Navbar;