import { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Container, Card } from 'semantic-ui-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './loginForm.css';
import { useNavigate } from 'react-router-dom';
export const LoginForm_camara = () => {
    const videoDiv = useRef();
    const [hayFoto, setHayFoto] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [username, setUsername] = useState("");
    const navigateTo = useNavigate();
    const verCamara = () => {
        navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } })
            .then(stream => {
                let miVideo = videoDiv.current;
                miVideo.srcObject = stream;
                miVideo.play();
            })
            .catch(err => {
                console.log(err);
            });
    };

    const handleCapturePhoto = async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const video = videoDiv.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoURL = canvas.toDataURL('image/png');
        setPhoto(photoURL);
        setHayFoto(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('image', dataURItoBlob(photoURL), 'photo.png');

        try {
            const response = await axios.post('http://192.168.1.49:8081/login_camara', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                const responseData = await response.data
                Swal.fire("Usuario autenticado", "Bienvenido a FaunaDex", "success");
                const { mensaje, user } = responseData;
                console.log(mensaje); // Mensaje del servidor
                console.log(user)

                navigateTo("/Home", { state: { user: user } });
       
                setUsername("");
                setPhoto(null);
                setHayFoto(false);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    Swal.fire("Error", "El usuario ya existe", "error");
                } else if (error.response.status === 500) {
                    Swal.fire("Error", "Error al ejecutar la consulta", "error");
                }else if (error.response.status === 404){
                    Swal.fire("Error", "El usuario no existe", "error");
                }
                else if (error.response.status === 305){
                    Swal.fire("Error", "No se pudo comparar las imagenes", "error");
                }   else if (error.response.status === 306){
                    Swal.fire("Error", "No se encontro ninguna coincidencia", "error");
                }
            } else {
                console.error('Error:', error);
            }
        }
    };

    // Función para convertir una URL de datos en un objeto Blob
    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        return blob;
    };

    useEffect(() => {
        verCamara();
    }, []);

    return (
        <div className="login-container">
            <Container>
                <div className="login-box">
                    <h2>Iniciar Sesión</h2>
                    <Form>
                        <Form.Group controlId="formBasicUsername">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese su usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </Form.Group>

                        <Container fluid textAlign="center">
                            <Container className="camara" textAlign="center">
                                <Card>
                                    <video ref={videoDiv} style={{ width: '100%', height: 'auto' }}></video>
                                </Card>
                            </Container>
                        </Container>
                        <Button variant="success" type="button" className="login-button" onClick={handleCapturePhoto}>
                            Capturar Foto
                        </Button>

                        {hayFoto && (
                            <div>
                                <h3>Foto Capturada:</h3>
                                <img src={photo} alt="Foto Capturada" style={{ width: '100%', height: 'auto' }} />
                            </div>
                        )}

                        <Form.Text className="text-muted">
                            ¿No tienes una cuenta? <a href="/create_user">Crea una aquí</a>.
                        </Form.Text>
                    </Form>
                </div>
            </Container>
        </div>
    );
};
