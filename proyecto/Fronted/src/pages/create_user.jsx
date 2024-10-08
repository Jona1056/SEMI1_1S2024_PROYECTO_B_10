import { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { FaTimes } from 'react-icons/fa';
import "./css/loginForm.css";
import axios from "axios";
import Swal from "sweetalert2";
export const Login_create = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  //correo
  const [email, setEmail] = useState("");

  // sns
  const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
    setPasswordMatch(password === password2);
  }, [password, password2]);


  const handleClose = () => {
    window.location.href = "/";
  };

  const handleSubscribe = async (email, usuario) =>{
    let data = JSON.stringify({
      "endpoint": email,
      "usuario":usuario
    });
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:8081/snsSubscribe',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
  }


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !name || !password || !password2 || !email) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (!passwordMatch) {
      alert("Las contraseñas no coinciden.");
      return;
    }




    const formData = new FormData();
    formData.append('username', username);
    formData.append('name', name);
    formData.append('password', password);
    formData.append('email', email);
    
    try {
      handleSubscribe(email, username);

      const response = await axios.post('http://127.0.0.1:8081/CreateUser', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      if (response.status === 200) {
        Swal.fire("Usuario creado exitosamente", "Bienvenido a Destinos Inteligentes", "success");
        //borrar valores en los campos
        setUsername("");
        setName("");
        setPassword("");
        setPassword2("");
        setEmail("");
        
        // Guardar la imagen en una carpeta de tu PC

        

      }
    } catch (error) {
      error.response.status === 400 && Swal.fire("Error","El usuario ya existe","error");
      error.response.status === 500 && Swal.fire("Error al ejecutar la consulta");
   
    }
  };

  return (
    <div className="login-container">
      <Container>
        <div className="login-box2">
        <FaTimes className="close-icon" onClick={handleClose} />
          <h2>Crea tu Usuario</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formUsername">
   
              <Form.Control
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formName">
          
              <Form.Control
                type="text"
                placeholder="Ingresa tu Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
            
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
       
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword2">
          
              <Form.Control
                type="password"
                placeholder="Repite tu contraseña"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                isInvalid={!passwordMatch}
              />
              {!passwordMatch && (
                <Form.Control.Feedback type="invalid" style={{ color: 'white', marginTop: '10px' }}>
                  Las contraseñas no coinciden.
                </Form.Control.Feedback>
              )}
            </Form.Group>

           

            
            <Form.Group controlId="formNotification">
              <Form.Check
                type="checkbox"
                label={<span style={{ textShadow: '0 0 15px white', fontSize: '1.1em' }}>Suscribirme a notificaciones</span>}
                checked={isSubscribed}
                onChange={(e) => setIsSubscribed(e.target.checked)}
              />
            </Form.Group>



            <Button className="button1" type="submit" >
              Crear
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};
