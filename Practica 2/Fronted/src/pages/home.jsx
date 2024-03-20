import { useLocation } from "react-router-dom";
import "./Home.css"; // Importa tu archivo CSS
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
  //yrl de la imagen
  const url = `${bucket_url}${user.image}`;
  console.log(url);
  const navigateTo = useNavigate();
    
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
  
  return (
    <div className="home-container">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
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