
import "./css/Home.css"; // Importa tu archivo CSS
// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { Navbar1 } from "./navbar_login";


// import { useState, useEffect } from "react";
export const Home = () => {

  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  //obtener datos de local store state

  useEffect(() => {
    const obtenerPublicaciones = async () => {
      try {
        const response = await fetch("http://localhost:3000/publicaciones");
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

  const agregarComentario = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/comentarios/${index}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comentario: nuevoComentario }),
      });
      if (response.ok) {
        // Si la solicitud fue exitosa, actualiza el estado para reflejar el comentario agregado
        setPublicaciones((prevPublicaciones) =>
          prevPublicaciones.map((publicacion, i) =>
            i === index
              ? { ...publicacion, comentarios: [...publicacion.comentarios, nuevoComentario] }
              : publicacion
          )
        );
        // Limpia el textarea después de agregar el comentario
        setNuevoComentario("");
      } else {
        console.error("Error al agregar el comentario:", response.statusText);
      }
    } catch (error) {
      console.error("Error al agregar el comentario:", error);
    }
  };

  const agregarmegusta = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/meGusta/${index}`, {
        method: "PUT",
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setPublicaciones((prevPublicaciones) =>
          prevPublicaciones.map((publicacion, i) =>
            i === index ? { ...publicacion, meGusta: data.meGusta } : publicacion
          )
        );
      } else {
        console.error("Error al aumentar el me gusta:", response.statusText);
      }
    } catch (error) {
      console.error("Error al aumentar el me gusta:", error);
    }
  };

  return (
    <div >
      <Navbar1  />
      <div className="container1">
      <h1>Publicaciones</h1>

      <div className="publicaciones-lista">
        {publicaciones.map((publicacion, index) => (
          <div key={index} className="publicacion">
            <h2>{publicacion.descripcion}</h2>
            <p>Categoría: {publicacion.categoria}</p>

            <button className="Btn" onClick={() => agregarmegusta(index)}>
              <span className="leftContainer">
                <svg
                  fill="white"
                  viewBox="0 0 512 512"
                  height="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path>
                </svg>
                <span className="like">Like</span>
              </span>
              <span className="likeCount"> {publicacion.meGusta}</span>
            </button>
            <h1>Comentarios</h1>
            {publicacion.comentarios.map((comentario, i) => (
              <p key={i}>{comentario}</p>
            ))}
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
            <button className="comment-button" onClick={() => agregarComentario(index)}>
              Agregar Comentario
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};