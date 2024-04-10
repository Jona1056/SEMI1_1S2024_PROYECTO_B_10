import {  Routes, Route, } from "react-router-dom";
import { LoginForm } from './pages/login';
import { Login_create } from './pages/create_user';
import {Navbar} from './pages/navbar_login';
import {Home} from './pages/home';
import {Edit} from './pages/edit_profile';
import {UploadPhoto} from './pages/upload_photo';
import {Images} from './pages/images';
import {EditAlbum} from './pages/edit_album';
import { LoginForm_camara } from "./pages/login_camara";
import { Extphoto } from "./pages/ext_photo";
import { DetalleFoto } from "./pages/DetalleFoto";

import Chat from './pages/chat'
function App() {
  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<LoginForm />} /> {/* Ruta para el inicio de sesión */}
        <Route path="/create_user"element={<Login_create />} /> {/* Ruta para crear usuario */}
        <Route path="/Home" element={<Home/>} /> {/* Ruta para el home */}
        <Route path="/EditProfile" element={<Edit/>} /> {/* Ruta para editar perfil */}
        <Route path="/UploadPhoto" element={<UploadPhoto/>} /> {/* Ruta para subir foto */}
        <Route path="/Images" element={<Images/>} /> {/* Ruta para ver fotos */}
        <Route path="/EditAlbum" element={<EditAlbum/>} /> {/* Ruta para editar album */}
        <Route path="/loginwithcamara" element={<LoginForm_camara />} /> {/* Ruta para el inicio de sesión con camara */}
        <Route path="/ext_phto" element={<Extphoto />} /> {/* Ruta para el inicio de sesión con camara */}
        <Route path="/DetalleFoto" element={<DetalleFoto/>} /> {/* Ruta para manejar errores */}
    </Routes>
    <Chat/>
    </>
  );
}

export default App;