import { NavLink, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black rounded-3">
      <div className="container-fluid">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">FaunaDex</NavLink>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <NavLink
              className="nav-link"
              to={location.pathname === "/" || location.pathname === "/loginwithcamara" ? "/" : "/"} 
              // Cambia "/logout" a la ruta principal "/"
            >
              {location.pathname === "/" || location.pathname === "/loginwithcamara" ? "Login" : "LogOut"}
            </NavLink>
          </ul>
        </div>
      </div>
    </nav>
  );
};
