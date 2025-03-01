import { Outlet } from "react-router-dom"
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const Layout = () => {
  return (
    <>
      <Navigation />
      <div className="content min-h-screen ml-64 max-lg:ml-0 bg-gray-100">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
