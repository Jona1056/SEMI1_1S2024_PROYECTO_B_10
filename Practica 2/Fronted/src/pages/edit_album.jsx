import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./images"; // Importar el archivo de estilos CSS
import axios from "axios";
import Swal from "sweetalert2";
export const EditAlbum = () => {
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
  // Estado para las opciones del menú desplegable
  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    fetchDropdownOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener las opciones del menú desplegable desde un endpoint
  const fetchDropdownOptions = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.username, name: user.name }),
    };

    try {
      const response = await fetch(
        "http://balanceaorprac1-1947984842.us-east-1.elb.amazonaws.com/GetAlbumns",
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const dropdownOptions = data.map((album) => ({
        value: album.id,
        label: album.name,
      }));

      setDropdownOptions(dropdownOptions);
    } catch (error) {
      console.error("Fetch error:", error);
    }

    // Una vez obtenidas las opciones, actualizar el estado dropdownOptions
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //verificar que se haya puesto nombre y seleccionado imagen
    if (!photoName || !fileImageUrl) {
      Swal.fire("Error", "Por favor complete todos los campos", "error");
      return;
    }
    //obtener el album seleccionado
    const dropdown = document.getElementById("dropdownOptions");
    const album = dropdown.options[dropdown.selectedIndex].value;

    const formData = new FormData();
    formData.append("photoName", photoName);
    formData.append("image", selectedImage);
    formData.append("album", album);
    console.log(formData);
    //peticion para subir foto
    try {
      const response = await axios.post(
        "http://balanceaorprac1-1947984842.us-east-1.elb.amazonaws.com/UploadPhotoAlbum",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      //limpiar campos
      setPhotoName("");
      setFileImageUrl(null);
      setSelectedImage(null);
      if (response.status === 200) {
        Swal.fire("Foto subida exitosamente", "Nueva foto", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Función para agregar una nueva opción al menú desplegable
  const addAlbums = async () => {
    const newOption = prompt("Ingrese el nombre de la nueva opción:");
    //peticion para AddAlbums
    if (!newOption) {
      Swal.fire("Error", "Por favor ingrese un nombre", "error");
      return;
    }
    try {
      const response = await axios.post("http://balanceaorprac1-1947984842.us-east-1.elb.amazonaws.com/AddAlbums", {
        username: user.username,
        name: user.name,
        album: newOption,
      });
      if (response.status === 200) {
        const newOption = {
          value: response.data.id,
          label: response.data.name,
        };
        setDropdownOptions([...dropdownOptions, newOption]);
      }
      Swal.fire("Album creado exitosamente", "Nuevo Album", "success");
    } catch (error) {
      console.log(error);
    }
  };

  const editAlbums = async () => {
    const newOption = prompt("Ingrese el nombre nuevo del Album");
    if (!newOption) {
      Swal.fire("Error", "Por favor ingrese un nombre", "error");
      return;
    }
    const dropdown = document.getElementById("dropdownOptions");
    const album = dropdown.options[dropdown.selectedIndex].value;

    try {
      const response = await axios.post("http://balanceaorprac1-1947984842.us-east-1.elb.amazonaws.com/EditAlbums", {
        album: album,
        newName: newOption,
      });
      if (response.status === 200) {
        //actualizar el estado dropdownOptions
        const newOption = {
          value: response.data.id,
          label: response.data.name,
        };
        setDropdownOptions([...dropdownOptions, newOption]);
        Swal.fire("Album editado exitosamente", "Nuevo Album", "success").then(
          (result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          }
        );
        //esperar hasta que le de ok
      }
    } catch (e) {
      console.log(e);
    }
  };
  const deleteAlbums = async () => { 
    const dropdown = document.getElementById("dropdownOptions");
    const album = dropdown.options[dropdown.selectedIndex].value;

    try {
      const response = await axios.post("http://balanceaorprac1-1947984842.us-east-1.elb.amazonaws.com/DeleteAlbums", {
        album: album,

      });
      if (response.status === 200) {
        //eliminar el album del id en las opciones
        const newOptions = dropdownOptions.filter((option) => option.value !== album);
        setDropdownOptions(newOptions);
        Swal.fire("Album Eliminado Correctamente", "Album Eliminado", "success").then(
          (result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          }
        );
      }
    } catch (e) {
      console.log(e);
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
          <button
            className="button_back"
            type="button"
            onClick={() => navigate("/Images", { state: { user } })}
          >
            Ver Fotos
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
            <label htmlFor="dropdownOptions">Albums:</label>
            <select id="dropdownOptions">
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button className="button-1" type="button" onClick={addAlbums}>
              Agregar Album
            </button>
            <button className="button-1" type="button" onClick={editAlbums}>
            Editar Album
          </button>
          <button className="button-1" type="button" onClick={deleteAlbums}>
            Eliminar Album
          </button>
          </div>

        
        </form>
        
      </div>
      
    </div>
  );
};
