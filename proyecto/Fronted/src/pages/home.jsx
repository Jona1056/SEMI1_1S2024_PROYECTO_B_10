import "./css/Home.css"; // Importa tu archivo CSS
// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { Navbar1 } from "./navbar_login";
import {useLocation } from "react-router-dom";

// import { useState, useEffect } from "react";
export const Home = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [puntuacion, setPuntuacion] = useState('');
  const [comentario, setComentario] = useState('');
  const location = useLocation();
  const user = location.state ? location.state.user : null;
  const [album, setAlbum] = useState('');
  const [filtro, setFiltro] = useState('');

  const handlePuntuacionChange = (e) => {
    setPuntuacion(e.target.value);
  };

  const handleComentarioChange = (e) => {
    setComentario(e.target.value);
  };
  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };
  const handleAlbumChange = (e) => {
    setAlbum(e.target.value);
  };

  const publicacionesFiltradas = publicaciones.filter((item) => {
    const nombrePais = item.publicacion.nombre_pais.toLowerCase();
    const estrellas = item.publicacion.estrellas.toString();
    const descripcion = item.publicacion.descripcion.toLowerCase();
    console.log(estrellas)
    return (
      nombrePais.includes(filtro.toLowerCase()) ||
      estrellas.includes(filtro) ||
      descripcion.includes(filtro.toLowerCase())
    );
  });
  // const [nuevoComentario, setNuevoComentario] = useState("");
  //obtener datos de local store state
  const bucket_url2 =
    "https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Publicadas/";
  useEffect(() => {
    const obtenerPublicaciones = async () => {
      try {
        const response = await fetch("http://192.168.1.44:8081/publicaciones");
        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de publicaciones");
        }
        const data = await response.json();
        console.log(data);

        setPublicaciones(data);
      } catch (error) {
        console.error("Error al obtener las publicaciones:", error);
      }
    };

    obtenerPublicaciones();
  }, []);

 

  const establecerEstrellas = (numeroEstrellas) => {
    // Creamos un array vacío para almacenar las estrellas
    let estrellas = [];
    // Recorremos el número de estrellas recibido
    for (let i = 0; i < 5; i++) {
      if (i < numeroEstrellas) {
        estrellas.push("⭐");
      } else {
        estrellas.push("✰");
      }
    }
    // Retornamos el array de estrellas
    return estrellas;
  };
  const establecerEstrellasPublicacion = (comentarios,idpublicacion) => {
    // recorrer lista
    let estrellas = [];
    // Recorremos el número de estrellas recibido
   
    if (comentarios.length === 0) {
      for (let i = 0; i < 5; i++) {
        estrellas.push("✰");
      }
      return estrellas
    }else{
      const totalEstrellas = comentarios.reduce((total, comentario) => total + comentario.estrellas_usuario, 0);
      const numeroEstrellas = Math.round(totalEstrellas / comentarios.length);
      for (let i = 0; i < 5; i++) {
        if (i < numeroEstrellas) {
          estrellas.push("⭐");
        } else {
          estrellas.push("✰");
        }
      }
      const data = {
        idpublicacion: idpublicacion,
        estrellas: numeroEstrellas
      };
      try{
        const response = fetch("http://127.0.0.1:8081/updatestar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error("No se pudo enviar el comentario");
        }
        }catch(e) {
          console.error("Error al enviar el comentario:", e);
  
      }
    }
   

    return estrellas;
    
  };
  const findAlbum = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8081/findalbum?filtro=${album}`);
      if (!response.ok) {
        throw new Error("Error al realizar la búsqueda");
      }
      const data = await response.json();
      // Actualizar la lista de publicaciones con los datos recibidos
      console.log(data)
      setPublicaciones(data); // Asumiendo que `setPublicaciones` está definido en tu componente
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
    }
  };
  const SendComentario = async (usuarioid) => {
    if (!puntuacion || !comentario) {
      alert("Por favor ingrese todos los campos");
      return;
    }
    if (puntuacion < 1 || puntuacion > 5) {
      alert("La puntuación debe ser entre 1 y 5");
      return;
    }
    
    const data = {
      idpublicacion: usuarioid,
      estrellas: puntuacion,
      comentario: comentario,
      idusuario: user.username
    };
    
    try {
      const response = await fetch("http://127.0.0.1:8081/addcoment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error("No se pudo enviar el comentario");
      }
  
      
 
      alert("Comentario enviado correctamente");
        //Recargar pagina
      window.location.reload();
      
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
    }
  };
  
  return (
    <div>
      <Navbar1 />

      <div className="container1">
      <input
      type="text"
      placeholder="Buscar por Pais, Descripcion o Estrellas"
      value={filtro}
      onChange={handleFiltroChange}
    />
    <input
      type="text"
      placeholder="Buscar por Album"
      value={album}
      onChange={handleAlbumChange}
    />
<button onClick={findAlbum}>Buscar</button>
      {publicacionesFiltradas.map((item, index) => (
        
          // eslint-disable-next-line react/jsx-key
          <div className="publicaciones-lista">
            <div key={index} className="publicacion">
              <div className="publicacion-info">
                <h2 className="encabezado">
                  Lugar: {item.publicacion.nombre_pais}
                </h2>
                <h2 
                value = {item.publicacion.id}
                className="encabezado">{item.publicacion.descripcion}</h2>
                <p id="stars1">
                      {establecerEstrellasPublicacion(item.comentarios,item.publicacion.id)
                      }
                    </p>
                <img
                  className="imagen"
                  src={`${bucket_url2}${item.publicacion.foto}`}
                  alt={`${bucket_url2}${item.publicacion.foto}`}
                />
              </div>
            

              {/* Área de comentarios */}
              <div className="comentarios-area">
                <h3 className="encabezado">Comentarios:</h3>
                {item.comentarios.map((comentario, index) => (
                  <div key={index} className="comentario">
                    <p>Usuario: {comentario.nombre_usuario}</p>
                    <p id="stars">
                      {establecerEstrellas(comentario.estrellas_usuario).join(
                        ""
                      )}
                    </p>
                    <p>{comentario.descripcion}</p>
                  </div>
                ))}
              </div>

              <div className="button-get-plan">
                <button id="punt"   onClick={() => SendComentario(item.publicacion.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20 "
                    className="svg-rocket"
                  >
                    <path d="M15.94,10.179l-2.437-0.325l1.62-7.379c0.047-0.235-0.132-0.458-0.372-0.458H5.25c-0.241,0-0.42,0.223-0.373,0.458l1.634,7.376L4.06,10.179c-0.312,0.041-0.446,0.425-0.214,0.649l2.864,2.759l-0.724,3.947c-0.058,0.315,0.277,0.554,0.559,0.401l3.457-1.916l3.456,1.916c-0.419-0.238,0.56,0.439,0.56-0.401l-0.725-3.947l2.863-2.759C16.388,10.604,16.254,10.22,15.94,10.179M10.381,2.778h3.902l-1.536,6.977L12.036,9.66l-1.655-3.546V2.778z M5.717,2.778h3.903v3.335L7.965,9.66L7.268,9.753L5.717,2.778zM12.618,13.182c-0.092,0.088-0.134,0.217-0.11,0.343l0.615,3.356l-2.938-1.629c-0.057-0.03-0.122-0.048-0.184-0.048c-0.063,0-0.128,0.018-0.185,0.048l-2.938,1.629l0.616-3.356c0.022-0.126-0.019-0.255-0.11-0.343l-2.441-2.354l3.329-0.441c0.128-0.017,0.24-0.099,0.295-0.215l1.435-3.073l1.435,3.073c0.055,0.116,0.167,0.198,0.294,0.215l3.329,0.441L12.618,13.182z"></path>
                  </svg>
                  <span>Comentario</span>
                </button>
              </div>
              <input
                id="star33"
                placeholder="Escribe tu Puntuacion (1-5)"
                name="text"
                className="input"
                value={puntuacion[100000]}
                onChange={handlePuntuacionChange}
              />
               <input
                id="star33"
                placeholder="Comentario"
                name="text"
                className="input"
                value={comentario[1000000000000]}
                onChange={handleComentarioChange}
              />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};
