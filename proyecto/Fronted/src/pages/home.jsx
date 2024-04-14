
import "./css/Home.css"; // Importa tu archivo CSS
// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { Navbar1 } from "./navbar_login";


// import { useState, useEffect } from "react";
export const Home = () => {

  const [publicaciones, setPublicaciones] = useState([]);

  // const [nuevoComentario, setNuevoComentario] = useState("");
  //obtener datos de local store state
  const bucket_url2 = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Publicadas/';
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

  // const agregarComentario = async (index) => {
  //   try {
  //     const response = await fetch(`http://localhost:3000/comentarios/${index}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ comentario: nuevoComentario }),
  //     });
  //     if (response.ok) {
  //       // Si la solicitud fue exitosa, actualiza el estado para reflejar el comentario agregado
  //       setPublicaciones((prevPublicaciones) =>
  //         prevPublicaciones.map((publicacion, i) =>
  //           i === index
  //             ? { ...publicacion, comentarios: [...publicacion.comentarios, nuevoComentario] }
  //             : publicacion
  //         )
  //       );
  //       // Limpia el textarea después de agregar el comentario
  //       setNuevoComentario("");
  //     } else {
  //       console.error("Error al agregar el comentario:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error al agregar el comentario:", error);
  //   }
  // };

 
  const establecerEstrellas = (numeroEstrellas) => {
    // Creamos un array vacío para almacenar las estrellas
    let estrellas = [];
    // Recorremos el número de estrellas recibido
    for (let i = 0; i < 5; i++) {
        // Si el índice actual es menor que el número de estrellas, agregamos una estrella completa
        if (i < numeroEstrellas) {
            estrellas.push("⭐");
        } else {
            // De lo contrario, agregamos una estrella vacía
            estrellas.push("✰");
        }
    }
    // Retornamos el array de estrellas
    return estrellas;
};
  return (
    <div >
      <Navbar1  />
      <div className="container1">
      <h1 className="encabezado">Publicaciones</h1>

    
        {publicaciones.map((item, index) => (
          // eslint-disable-next-line react/jsx-key
          <div className="publicaciones-lista">
          <div key={index} className="publicacion">
          <h2 className="encabezado">Lugar: {item.publicacion.nombre_pais}</h2>
            <h2 className="encabezado">{item.publicacion.descripcion}</h2>
            <p id="stars">⭐✰✰✰✰</p>
            <img className="imagen"
                      src={`${bucket_url2}${item.publicacion.foto}`}
                      alt={`${bucket_url2}${item.publicacion.foto}`}
                    />
              <p className="information">{"descripcion"}</p>
            <div className="button-get-plan">
                <a id="punt" href="#" >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20 " className="svg-rocket">
                        <path d="M15.94,10.179l-2.437-0.325l1.62-7.379c0.047-0.235-0.132-0.458-0.372-0.458H5.25c-0.241,0-0.42,0.223-0.373,0.458l1.634,7.376L4.06,10.179c-0.312,0.041-0.446,0.425-0.214,0.649l2.864,2.759l-0.724,3.947c-0.058,0.315,0.277,0.554,0.559,0.401l3.457-1.916l3.456,1.916c-0.419-0.238,0.56,0.439,0.56-0.401l-0.725-3.947l2.863-2.759C16.388,10.604,16.254,10.22,15.94,10.179M10.381,2.778h3.902l-1.536,6.977L12.036,9.66l-1.655-3.546V2.778z M5.717,2.778h3.903v3.335L7.965,9.66L7.268,9.753L5.717,2.778zM12.618,13.182c-0.092,0.088-0.134,0.217-0.11,0.343l0.615,3.356l-2.938-1.629c-0.057-0.03-0.122-0.048-0.184-0.048c-0.063,0-0.128,0.018-0.185,0.048l-2.938,1.629l0.616-3.356c0.022-0.126-0.019-0.255-0.11-0.343l-2.441-2.354l3.329-0.441c0.128-0.017,0.24-0.099,0.295-0.215l1.435-3.073l1.435,3.073c0.055,0.116,0.167,0.198,0.294,0.215l3.329,0.441L12.618,13.182z"></path>
                    </svg>
                    <span>PUNTUACION</span>
                </a>
            </div>
            <input id="star33"   placeholder="Escribe tu Puntuacion (1-5)" name="text" className="input" />
        
            {/* Área de comentarios */}
            <div className="comentarios-area">
                <h3>Comentarios:</h3>
                {item.comentarios.map((comentario, index) => (
                  
                    <div key={index} className="comentario">
                      <p>Usuario: {comentario.nombre_usuario}</p>
                      <p id="stars">{establecerEstrellas(comentario.estrellas_usuario).join("")}</p>
                        <p>{comentario.descripcion}</p>
                    </div>
                ))}
            </div>
          </div>
          </div>
        ))}

      </div>
    </div>
  );
};