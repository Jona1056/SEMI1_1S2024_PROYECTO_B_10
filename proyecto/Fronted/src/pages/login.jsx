import { useState } from "react";
import { Form, Button} from "react-bootstrap";
import "./css/loginForm.css";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
   
    try {
      // fetch("http://192.168.1.49:8081/login"
      const response = await fetch("http://127.0.0.1:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.status === 200) {
        const responseData = await response.json();
        Swal.fire("Usuario autenticado", "Bienvenido a FaunaDex", "success");
        const { message, user } = responseData;
        console.log(message); // Mensaje del servidor
        console.log(user)

        navigateTo("/Home", { state: { user: user } });

        //borrar valores en los campos
        setUsername("");
        setPassword("");
      }else if(response.status === 401){
        Swal.fire("Error","Contraseña incorrecta","error"); 
      }else if
      (response.status === 400|| response.status === 500){
        Swal.fire("Error","Usuario no encontrado","error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
   
    
    <div className="blurred-box">
   
      <div className="user-login-box">
      
        <Form.Group controlId="formUsername">
         
              <Form.Control className="user-password"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
          
              <Form.Control className="user-password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button className="" onClick={handleLogin}>Ingresar</Button>
            <Form.Text className="user-name">
              ¿No tienes una cuenta? <a href="/create_user">Crea una aquí</a>.
            </Form.Text>


   
      </div>
      
    </div>
  );
}
