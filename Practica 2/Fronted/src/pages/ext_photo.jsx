import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./css/ext_photo.css"; // Importar el archivo de estilos CSS
import axios from "axios";
import Swal from "sweetalert2";

export const Extphoto = () => {
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


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    // Actualizar el estado para almacenar la URL de la imagen
    setSelectedImage(file);
    setFileImageUrl(imageUrl);
  };

  // Función para enviar la imagen seleccionada
  const sendImage = async () => {
    // Verificar que se haya seleccionado una imagen
    if (!selectedImage) {
      Swal.fire("Error", "Por favor seleccione una imagen", "error");
      return;
    }

    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      // Realizar la petición para enviar la imagen
      const response = await axios.post(
        "http://192.168.1.49:8081/GetText",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Mostrar un mensaje de éxito si la respuesta es satisfactoria
      if (response.status === 200) {
       //setear el texto al text area
       // es un objeto imprimirlo bien
       
       var mensajeCadena = '';
       for (var i = 0; i < response.data.mensaje.length; i++) {
           mensajeCadena +=response.data.mensaje[i] + " ";
       }
       
       // Establecer el nombre de la foto
       setPhotoName(mensajeCadena);
       //poner imagen en blanco
      
        
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Ocurrió un error al enviar la imagen", "error");
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
        <div
          aria-label="Orange and tan hamster running in a metal wheel"
          role="img"
          className="wheel-and-hamster"
        >
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
        <form>
          <div>
            <label htmlFor="image">Seleccionar imagen:</label>
            <input
              type="file"
              accept="image/*"
              id="image"
              onChange={handleImageChange}
            />
            {fileImageUrl && (
              <img
                src={fileImageUrl}
                alt="Imagen seleccionada"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            )}
          </div>

          <div>
            <button type="button" onClick={sendImage}>
              Enviar Imagen
            </button>
          </div>
        </form>

        <textarea
          className="input_text"
          type="text"
          placeholder="Texto"
          value={photoName}
          onChange={(e) => setPhotoName(e.target.value)}
        />
      </div>
    </div>
  );
};
