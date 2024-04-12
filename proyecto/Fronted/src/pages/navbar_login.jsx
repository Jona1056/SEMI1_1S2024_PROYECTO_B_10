import { NavLink} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export const Navbar1 = () => {
  const location = useLocation();
  const user = location.state ? location.state.user : null;
  const navigateTo = useNavigate();
  const goImages = () => {
    navigateTo("/addpost", { state: { user: user } });
  };
  const goImagessee = () => {
    navigateTo("/Home", { state: { user: user } });
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black rounded-3">
      <div className="container-fluid">
        <div className="container-fluid">
          <NavLink className="navbar-brand" >Viajes</NavLink>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          <ul className="navbar-nav ms-auto"> {/* Utiliza la clase 'ms-auto' para alinear a la derecha */}
          <li className="nav-item dropdown">
              <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Informacion
              </NavLink>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><h4 className="dropdown-item" >Usuario: {user.username}</h4></li>
                <li><h4 className="dropdown-item" >Nombre: {user.name}</h4></li>
                <li><h4 className="dropdown-item" >Email: {user.email}</h4></li>
                
              </ul>
            </li>
            <li className="nav-item">
            <button className="nav-link" onClick={goImages}>Agregar Imágenes</button>

            </li>
            <li className="nav-item">
            <button className="nav-link" onClick={goImagessee}>Ver Imágenes</button>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Cerrar Sesion</NavLink>
            </li>
            {/* Dropdown */}
          
          </ul>
        </div>
      </div>
    </nav>
  );
};