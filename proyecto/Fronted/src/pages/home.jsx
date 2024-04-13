
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

 

  return (
    <div >
      <Navbar1  />
      <div className="container1">
      <h1 className="encabezado">Publicaciones</h1>

    
        {publicaciones.map((publicacion, index) => (
          // eslint-disable-next-line react/jsx-key
          <div className="publicaciones-lista">
          <div key={index} className="publicacion">
            <h2 className="encabezado">{publicacion[1]}</h2>
            <img className="imagen"
                      src={`${bucket_url2}${publicacion[2]}`}
                      alt={`${bucket_url2}${publicacion[2]}`}
                    />
            
            {/* <h1>Comentarios</h1>
            {publicacion.comentarios.map((comentario, i) => (
              <p key={i}>{comentario}</p>
            ))}
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
            <button className="comment-button" onClick={() => agregarComentario(index)}>
              Agregar Comentario
            </button> */}
          </div>
          </div>
        ))}

      </div>
    </div>
  );
};