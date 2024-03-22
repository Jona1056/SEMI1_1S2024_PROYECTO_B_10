import { useLocation } from "react-router-dom";
import "./css/Home.css"; // Importa tu archivo CSS
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
export const Home = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
  const [tags, setTags] = useState(null);
  const url = `${bucket_url}${user.image}`;
  console.log(url);
  const navigateTo = useNavigate();
  

  useEffect(() => {
      //recargar pagina
      
      get_tags();
         // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const get_tags= async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url }),
    };

    try {
      const response = await fetch(
        "http://localhost:8081/GetTags",
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTags(data);
      console.log(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }

    // Una vez obtenidas las opciones, actualizar el estado dropdownOptions
  };
  const edit_profile = () => {
    navigateTo("/EditProfile", { state: { user: user,image:url } });
  }

  const upload_photo = () => {
    navigateTo("/UploadPhoto", { state: { user: user,image:url } });
  }
  const images = () => {
    navigateTo("/Images", { state: { user: user,image:url } });
  }

  const edit_album = () => {
    navigateTo("/EditAlbum", { state: { user: user,image:url } });
  }
  const ext_phto = ()  => {
    navigateTo("/ext_phto", { state: { user: user,image:url } })
  }
  
  return (
    <div className="home-container">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
          {tags ? (
          <p>{tags.user.tags.join(' ')}</p>
        ) : (
          <div className="loader"></div>

        )}
      
        </div>
      </div>
      <div className="Botones-css">
      <button onClick={images} className="batman">
        <span>VER FOTOS</span>
      </button >
      <button onClick={upload_photo}className="batman">
        <span >SUBIR FOTO</span>
      </button>
      <button onClick={edit_profile}className="batman">
        <span>EDITAR PERFIL</span>
      </button>
      <button onClick={edit_album} className="batman">
        <span>EDITAR ALBUMES</span>
      </button>
      <button onClick={ext_phto} className="batman">
        <span>EXTRAER TEXTO</span>
      </button>
      </div>

      <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
	<div className="wheel"></div>
	<div className="hamster">
		<div className="hamster__body">
			<div className="hamster__head">
				<div className="hamster__ear"></div>
				<div className="hamster__eye"></div>
				<div className="hamster__nose"></div>
			</div>
			<div className="hamster__limb hamster__limb--fr"></div>
			<div className="hamster__limb hamster__limb--fl"></div>
			<div className="hamster__limb hamster__limb--br"></div>
			<div className="hamster__limb hamster__limb--bl"></div>
			<div className="hamster__tail"></div>
		</div>
	</div>
	<div className="spoke"></div>
</div>
    </div>

    
  );
};