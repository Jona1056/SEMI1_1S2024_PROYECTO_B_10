import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import "./css/Detallefoto.css";
export const DetalleFoto = () => {
    const location = useLocation();
    const {fotoId } = location.state;
    const [Detalle, SetDetalle] = useState([]);
    const bucket_url2 = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Publicadas/';
    const [selectedOption, setSelectedOption] = useState(null);
    const [traduccion, setTraduccion] = useState(null);
    useEffect(() => {
        obtenerDetalle();
    }, []);
    const obtenerDetalle = async () => {
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ IdFoto: fotoId}),
        };
        try {
          const response = await fetch('http://18.223.187.228:8081/DetalleFoto', requestOptions);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          SetDetalle(data);
        } catch (error) {
          console.error('Fetch error:', error);
        }
        
      };
     
      const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
      };

    const traducir = async (e)=> {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texto: Detalle.detalle , idioma: selectedOption}),
          };
          try {
            const response = await fetch('http://18.223.187.228:8081/Traduccion', requestOptions);
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setTraduccion(data);
          } catch (error) {
            console.error('Fetch error:', error);
          }
 
    }

    return (
        <div className="container">
                <div className="image-container">
                    <img src={`${bucket_url2}${Detalle.imagen}`} alt={`${bucket_url2}${Detalle.imagen}`} />
                </div>
                <div className="form-container">
                    <label>Descripcion</label>
                    <textarea className="textarea" value={Detalle.detalle} readOnly rows="4" cols="50" placeholder="Descripcion" />
                    <div className="select-container">
                        <label>Seleccione Un Idioma</label>
                        <select value={selectedOption} onChange={handleOptionChange}>
                            <option value="Español">Español</option>
                            <option value="Ingles">Ingles</option>
                            <option value="Aleman">Aleman</option>
                            <option value="Chino">Chino</option>
                            </select>
                    </div>
                    <div className="button-container">
                        <button onClick={traducir}>Traducir</button>
                        <button onClick={() => { window.history.back(); }}>Regresar</button>
                    </div>
                    {traduccion && (
                    <div className="traduccion-container">
                        <label>Traducción:</label>
                        <p>{traduccion}</p>
                    </div>
                )}
               
                </div>
               
        </div>

    )
}
