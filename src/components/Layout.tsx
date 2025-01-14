import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;