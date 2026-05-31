import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getPageBackgroundStyle } from './theme';

export default function App() {
  const { pathname } = useLocation();
  const bgStyle = getPageBackgroundStyle(pathname);

  return (
    <>
      <Navbar />
      <main className="page" style={bgStyle || undefined}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
