import { useState } from "react";

import "./css/agregarpublicacion.css";
import { Navbar1 } from "./navbar_login";
import Swal from "sweetalert2";
import axios from "axios";
// eslint-disable-next-line react/prop-types
export const AgregarPublicacion = () => {

  const [photoReseña, setPhotoReseña] = useState("");
  const [photoPais, setPhotoPais] = useState("");
  const [fileImageUrl, setFileImageUrl] = useState(null);
  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
        if(!photoPais || !photoReseña || !fileImageUrl){
            Swal.fire("Error", "Por favor complete todos los campos", "error");
            return;
        }

        const formData = new FormData();
        formData.append("reseña", photoReseña);
        formData.append("Pais", photoPais);
        formData.append("image", selectedImage);
        formData.append("image2", selectedImage);
        console.log(formData);

        try{
            const response = await axios.post("http://127.0.0.1:8081/UploadPhotoAlbum",formData,{
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            //limpiar campos
            setPhotoPais("");
            setFileImageUrl(null);
            setSelectedImage(null);
            setPhotoReseña(null)
            if (response.status === 200) {
                Swal.fire("Foto subida exitosamente", "Nueva foto", "success");
            }
        }catch(error){
            console.log(error)
        }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    // Actualizar el estado para almacenar la URL de la imagen
    setSelectedImage(file);
    setFileImageUrl(imageUrl);
  };

  return (
    <div className="div-principal">
      <Navbar1 />
      <div className="ap-container">
        <h1>Agregar Publicación</h1>
        <form onSubmit={handleSubmit}>
        <div>

            <h1 htmlFor="image">Cargar Imagen</h1>
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
                style={{ maxWidth: "200px", height: "auto", marginLeft:"18px"}}
              />
            )}
          </div>

     
          <div>
            <h1 htmlFor="photoName">Reseña</h1>
            <input
              type="text"
              id="photoName"
              value={photoReseña}
              onChange={(e) => setPhotoReseña(e.target.value)}
            />
          </div>

          <div>
            <h1 htmlFor="photoName">Pais</h1>
            <input
              type="text"
              id="photoName"
              value={photoPais}
              onChange={(e) => setPhotoPais(e.target.value)}
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
