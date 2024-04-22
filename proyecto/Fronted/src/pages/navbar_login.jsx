import { useState } from 'react';
import { NavLink} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from "axios";

export const Navbar1 = () => {
  const location = useLocation();
  const user = location.state ? location.state.user : null;
  const navigateTo = useNavigate();

  const [isSubscribed, setIsSubscribed] = useState(null);

  const [arnSubs, setArnSubs] = useState(null);

  // Función para obtener el estado de suscripción del usuario desde el servidor
  const fetchSubscriptionStatus = async () => {
    let data = JSON.stringify({
      "usuario": user.username
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:8081/snsCheckSubs',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      // Actualiza el estado de suscripción según la respuesta del servidor
      //console.log(response.data["isSub"]);
      setIsSubscribed(response.data["isSub"]);
      setArnSubs(response.data["arn"]);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  fetchSubscriptionStatus();

  const handleSubscription = () => {
    if (isSubscribed) {
      let data = JSON.stringify({
        "subscriptionArn": arnSubs,
        "usuario" : user.username
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://127.0.0.1:8081/snsUnsubscribe',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        Swal.fire("Se anuló correctamente la suscripcion", "No recibirás más correos de FaunaDex", "success");
        setIsSubscribed(false);
      })
      .catch((error) => {
        console.log(error);
      });

      
    } else {
      let data = JSON.stringify({
        "endpoint": user.email,
        "usuario":user.username
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://127.0.0.1:8081/snsSubscribe',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        Swal.fire("Suscripción exitosa", "Bienvenido a las noticias de FaunaDex, por favor confirma tu correo electrónico", "success");      
        setIsSubscribed(true);
        //fetchSubscriptionStatus();

      })
      .catch((error) => {
        console.log(error);
      });
    }
  };

  const goImages = () => {
    navigateTo("/addpost", { state: { user: user } });
  };
  const goImagessee = () => {
    navigateTo("/Home", { state: { user: user } });
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black rounded-3">
      <div className="container-fluid">
        <div className="container-fluid" style={{display: "flex", alignItems: "center"}}>
          {/*imagen*/}
          <img src="./src/assets/viajar.png" alt="Viajrar" style={{ width: '50px', height: '50px' }}/>
          <h1 className="navbar-brand" style={{ marginRight:"100px"}}>Destinos Inteligentes</h1>
         
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          <ul className="navbar-nav ms-auto"> {/* Utiliza la clase 'ms-auto' para alinear a la derecha */}
          <li className="nav-item">
              {/* Cambia el texto del botón según el estado de suscripción */}
              <button className="nav-link" onClick={handleSubscription}>
                {isSubscribed ? "Anular suscripción" : "Suscribirse"}
              </button>
          </li>
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