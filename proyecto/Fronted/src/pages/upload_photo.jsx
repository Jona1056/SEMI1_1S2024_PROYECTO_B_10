import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./css/upload_photo.css"; // Importar el archivo de estilos CSS
import axios from "axios";
import Swal from "sweetalert2";
export const UploadPhoto = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url =
    "https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/";
  // URL de la imagen
  const url = `${bucket_url}${user.image}`;
  const navigate = useNavigate();

  // Estado para el nombre de la foto
  const [photoName, setPhotoName] = useState("");
  const [fileImageUrl, setFileImageUrl] = useState(null);
  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState(null);

  const [desc , setDesc] = useState("");


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    // Actualizar el estado para almacenar la URL de la imagen
    setSelectedImage(file);
    setFileImageUrl(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //verificar que se haya puesto nombre y seleccionado imagen
    if (!photoName || !fileImageUrl) {
      Swal.fire("Error", "Por favor complete todos los campos", "error");
      return;
    }

  
    const formData = new FormData();
    formData.append("photoName", photoName);
    formData.append("image1", selectedImage);
    formData.append("image2", selectedImage);
    formData.append("desc", desc);
    formData.append("username", user.username);
    console.log(formData);
    //peticion para subir foto
    try{
        const response = await axios.post("http://127.0.0.1:8081/UploadPhotoAlbum",formData,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        //limpiar campos
        setPhotoName("");
        setFileImageUrl(null);
        setSelectedImage(null);
        if (response.status === 200) {
            Swal.fire("Foto subida exitosamente", "Nueva foto", "success");
        }
    }catch(error){
        console.log(error)
    }
  };

  return (
    <div className="home-container1">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
          <button
            className="button_back"
            type="button"
            onClick={() => navigate("/Home", { state: { user } })}
          >
            Perfil
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
      <div className="upload-form">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="photoName">Nombre de la foto:</label>
            <input
              type="text"
              id="photoName"
              value={photoName}
              onChange={(e) => setPhotoName(e.target.value)}
            />
            
          </div>
          <div>
            <label htmlFor="image">Cargar Imagen</label>
            <input
              type="file"
              accept="image/*"
              id="image"
              onChange={handleImageChange}
            />
           {fileImageUrl  && <img src={fileImageUrl}
      alt="Imagen seleccionada"
      style={{ maxWidth: '200px', height: 'auto' }}  />}
 
 
          </div>
          <div className="desc">
              <label htmlFor="dropdownOptions">Descripcion:</label>
              <textarea className="textdesc" id="dropdownOptions" name="dropdownOptions" rows="8" cols="50"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}              
              />
          </div>
          <div>
            <button type="submit">Subir foto</button>
          </div>
 
       
        </form>
      </div>
    </div>
  );
};
