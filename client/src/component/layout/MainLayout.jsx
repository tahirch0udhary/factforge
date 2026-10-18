import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_18%_15%,rgba(217,119,6,0.12),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(15,118,110,0.16),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-40 h-px bg-gradient-to-r from-transparent via-stone-300/70 to-transparent" />
      <Navbar />
      <main className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
