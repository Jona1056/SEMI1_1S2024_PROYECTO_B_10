from flask import Flask, request, jsonify
from flask_cors import CORS
from db import query
from encripty import hash_password
from s3 import SubirS3 ,Tranlatetext
from s3 import traerImagen
from rekognition import detect_similitud, detect_faces,detect_text, newAlbumnstag
from io import BytesIO
from PIL import Image

import os
url_bucket = "https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/"
app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Ok" , 200



# ---------------------------------------- USER ----------------------------------------

@app.route('/CreateUser', methods=['POST'])
def api_create_user():
    user = request.form['username']
    password = request.form['password']
    name = request.form['name']
    images = request.files['image']

    newFilename = NewPhotoName(user)
    
    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))

    if len(results) > 0:
        return jsonify({'mensaje':"El usuario ya existe"}), 400
    
    password = hash_password(password)
    results,  usuario_id = query("INSERT INTO Usuario (usuario , nombre , contrasena) VALUES (%s, %s, %s)", (user, name,password,))


    TipeFormat = images.filename.split(".")[-1]
    images.filename = newFilename + "." + TipeFormat
    fotoperfil = "Fotos_Perfil/"+images.filename

    SubirS3(fotoperfil, images)

    query("INSERT INTO FotoPerfil (usuario_id, foto) VALUES (%s, %s)", (usuario_id,images.filename))

    
    return jsonify({'mensaje':"usuario creado"}), 200


@app.route('/login', methods=['POST'])
def api_login():
    user = request.json.get('username')
    password = request.json.get('password')
    
    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))

    if len(results) == 0:
        return jsonify({'mensaje':"El Usuario No Existe"}), 404
    
    password = hash_password(password)

    if password != results[0][3]:
        return jsonify({'mensaje':"Contraseña incorrecta"}), 401
    
    datos_personales = results[0]

    results,_ = query("SELECT foto FROM FotoPerfil WHERE usuario_id = %s ORDER BY id DESC LIMIT 1", (datos_personales[0],))

    
    print(datos_personales)
    return jsonify({
            "mensaje":"Usuario logueado",
            "user":{
                "username":datos_personales[1],
                "name":datos_personales[2],
                "image":results[0][0]
            }}), 200
    
@app.route('/login_camara', methods=['POST'])   
def api_login_camara():
    user = request.form['username']
    image = request.files['image']
    results, _ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje': "El Usuario No Existe"}), 404

    datos_personales = results[0]
    results, _ = query("SELECT foto FROM FotoPerfil WHERE usuario_id = %s ORDER BY id DESC LIMIT 1", (datos_personales[0],))
    imagen_s3 = results[0][0]
    imagen_url = url_bucket + imagen_s3
    image_data = image.read()
    rekog = detect_similitud(imagen_url, image_data)
    if (rekog == False):
         return jsonify({
        "mensaje": "No se puedo comparar las imagenes",
       }), 305
         
    result = rekog.get('FaceMatches')
    if (result == None or len(result) == 0):
        return jsonify({
        "mensaje": "No se encontro ninguna coincidencia",
       }), 306    
        
    result = result[0]
    result = result["Similarity"]
    print(result)
    if(result < 95):
        return jsonify({
        "mensaje": "No se encontro coincidencia en las imagenes", 
       }), 306
    tags = detect_faces(imagen_url)
    print(tags)
    return jsonify({
        "mensaje": "Usuario autenticado",
        "user": {
            "username": datos_personales[1],
            "name": datos_personales[2],
            "image": imagen_s3
        }}), 200
    
@app.route('/GetTags', methods=['POST'])
def get_tags_perfil():
    image = request.json.get('url')
    datos  = []
    tags = detect_faces(image)
    face_detalles = tags["FaceDetails"][0]

    age_range = face_detalles["AgeRange"]
    age_range = f"{age_range['Low']} - {age_range['High']} Años"
    Gender = face_detalles["Gender"]

    if Gender["Value"] == "Male":
        Gender = "Hombre";
    else:
        Gender = "Mujer";
    datos.append(Gender)
    datos.append(age_range)
    print(face_detalles["Smile"]["Value"])
    if face_detalles["Smile"]["Value"] == False:
        print("no sonriendo")
    else:
        datos.append("Sonriendo")
        
    if face_detalles["Eyeglasses"]["Value"]== False:
        print("no tiene lentes")
    else:
        datos.append("Tiene lentes")

        
    if face_detalles["Beard"]["Value"]== False:
        print("no tiene barba")
    else:
        datos.append("Tiene barba")
        
    if face_detalles["Mustache"]["Value"]== False:
        print("no tiene mustache")
    else:
        datos.append("Tiene mustacho")
        
    print(face_detalles["Emotions"][0])

    if(face_detalles["Emotions"][0]["Type"] == "CALM"):
        datos.append("Calmado")
    elif(face_detalles["Emotions"][0]["Type"] == "HAPPY"):
        datos.append("Feliz")
    elif(face_detalles["Emotions"][0]["Type"] == "SAD"):
        datos.append("Triste")
    elif(face_detalles["Emotions"][0]["Type"] == "ANGRY"):
        datos.append("Enojado")
    elif(face_detalles["Emotions"][0]["Type"] == "DISGUSTED"):
        datos.append("Disgustado")
    elif(face_detalles["Emotions"][0]["Type"] == "SURPRISED"):
        datos.append("Sorprendido")
    elif(face_detalles["Emotions"][0]["Type"] == "CONFUSED"):
        datos.append("Confundido")
    elif(face_detalles["Emotions"][0]["Type"] == "FEAR"):
        datos.append("Asustado")
        
  
    return jsonify({
        "mensaje": "Usuario autenticado",
        "user": {
            "tags": datos
        }}), 200
    
@app.route('/GetText', methods=['POST'])
def api_get_text():
    if 'image' not in request.files:
            return {'message': 'No se encontró ninguna imagen en la solicitud'}, 400
    
    image = request.files['image']	
    image_data = image.read()
    de_text = detect_text(image_data)

    detected_texts = []  # Usar una lista para mantener el orden

    for text_detection in de_text['TextDetections']:
        if text_detection['Type'] == 'LINE':
            detected_texts.append(text_detection['DetectedText'])

# Ahora, 'detected_texts' contendrá solo los textos detectados donde el Type sea "LINE", en el orden en que se detectaron
    print(detected_texts)

    return jsonify({
        "mensaje": detected_texts
     }), 200
    
@app.route('/EditUser', methods=['POST'])
def api_edit_user():
    global Newimages , boolImage
    boolImage = False
    Newuser = request.form['username']
    Newpassword = request.form['password']
    Newname = request.form['name']
    user = request.form['useroriginal']
    images = request.form['imageoriginal']

    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"El Usuario No Existe"}), 404
    
    password = hash_password(Newpassword)

    if results[0][3] != password:
        return jsonify({'mensaje':"Contraseña incorrecta"}), 401
    
    if 'image' not in request.files or request.files['image'] is None:
        print("No se ha enviado ningún archivo de imagen.")
    else:
        Newimages = request.files['image']

        TipeFormat = Newimages.filename.split(".")[-1]

        Newimages.filename = NewPhotoName(user) + "." + TipeFormat

        fotoperfil = "Fotos_Perfil/"+Newimages.filename
        SubirS3(fotoperfil, Newimages)
        query("INSERT INTO FotoPerfil (usuario_id, foto) VALUES (%s, %s)", (results[0][0],Newimages.filename))
        boolImage = True

    resultUpdate , _ = query("UPDATE Usuario SET usuario = %s, nombre = %s WHERE usuario = %s", (Newuser, Newname, user))

    if boolImage:
        return jsonify({
            "mensaje":"Usuario Editado",
            "user":{
                "username":Newuser,
                "name":Newname,
                "image":Newimages.filename
            }}), 200
    else:
        return jsonify({
            "mensaje":"Usuario Editado",
            "user":{
                "username":Newuser,
                "name":Newname,
                "image":images
            }}), 200



# ---------------------------------------- ALBUM ----------------------------------------

@app.route('/GetAlbumns', methods=['POST'])
def api_get_albumns():
    user = request.json.get('username')
    results,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"Usuario no encontrado"}), 405
    
    UserId = results[0][0]
    results,_ = query("SELECT * FROM Album WHERE usuario_id = %s", (UserId,))
    

    albumns = [{'id': album[0], 'name': album[2]} for album in results]

    return jsonify(albumns), 200





@app.route('/EditAlbums', methods=['POST'])
def api_edit_albums():
    album = request.json.get('album')
    newName = request.json.get('newName')

    _,_ = query("UPDATE Album SET nombre = %s WHERE id = %s", (newName,album,))

    return jsonify({"id":album , "name": newName}), 200


@app.route('/DeleteAlbums', methods=['POST'])
def api_delete_albums():
    album = request.json.get('album')

    _,_ = query("DELETE FROM Foto WHERE album_id =  %s", (album,))

    _,_ = query("DELETE FROM Album WHERE id = %s", (album,))

    return jsonify({"id":album}), 200




# ---------------------------------------- FOTO ----------------------------------------
@app.route('/DetalleFoto', methods=['POST'])
def api_detalle_foto():
    foto = request.json.get('IdFoto')
    results,_ = query("SELECT * FROM Foto WHERE id = %s", (foto,))
    if len(results) == 0:
        return jsonify({'mensaje':"Foto no encontrada"}), 405
    
    print(results)
    return jsonify({"imagen":results[0][2] , "detalle": results[0][3]}) , 200

@app.route('/GetFotosAlbum', methods=['POST'])
def api_get_fotos_album():
    albums = request.json.get('albums')
    names = request.json.get('names')
    
    listphotos = {}
    for index , id_album  in enumerate(albums):
        results,_ = query("SELECT * FROM Foto WHERE album_id = %s", (id_album,))
        jsonenv = {
            "listfotos":[ foto[2] for index , foto in enumerate(results)],
            "listid": [ foto[0] for index , foto in enumerate(results)], 
        }   
        listphotos[names[index]] = jsonenv
         
    return  jsonify(listphotos), 200

@app.route('/GetFotosPerfil', methods=['POST'])
def api_get_fotos_perfil():
    user = request.json.get('username')
    results,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"Usuario no encontrado"}), 405
    
    UserId = results[0][0]
    results,_ = query("SELECT foto FROM FotoPerfil WHERE usuario_id = %s", (UserId,))
    
    fotos = [{'foto': foto[0]} for foto in results]

    return jsonify(fotos), 200


@app.route('/UploadPhotoAlbum', methods=['POST'])
def api_upload_photo_album():
    photoName = request.form['photoName']
    imageR = request.files['image1']
    imageS3 = request.files['image2']
    desc = request.form['desc']
    user = request.form['username']


    TipeFormat = imageS3.filename.split(".")[-1]
    NewName = f"{photoName}.{TipeFormat}"
    imageS3.filename = NewName


    id_user,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    ListaAlbums = newAlbumnstag(imageR) 
    for album in ListaAlbums:
        Existe,_= query("SELECT  COUNT(*) , id FROM Album WHERE  usuario_id = %s and nombre = %s", (id_user[0][0],album,))
        if Existe[0][0] == 0:
            _, id_album = query("INSERT INTO Album (usuario_id, nombre) VALUES (%s, %s)", (id_user[0][0], album,))
            query("INSERT INTO Foto (foto , album_id , descripcion) VALUES (%s, %s, %s)", (imageS3.filename , id_album ,  desc,))
            print("album creado")
        else:
            query("INSERT INTO Foto (foto , album_id , descripcion) VALUES (%s, %s, %s)", (imageS3.filename , Existe[0][1] ,  desc,))
            print("Ya existe el album")
    
    SubirS3(f"Fotos_Publicadas/{NewName}", imageS3)
   
    return jsonify({'message': "Foto subida exitosamente"}), 200



@app.route('/Traduccion', methods=['POST'])
def api_traduccion():
    text = request.json.get('texto')
    idioma = request.json.get('idioma')
    EnvTraduccion = ""
    if idioma == "Aleman":
        EnvTraduccion = Tranlatetext(text, "de")
    elif idioma == "Ingles":
        EnvTraduccion = Tranlatetext(text, "en")
    elif idioma == "Chino":
        EnvTraduccion = Tranlatetext(text, "zh")
    else:
        EnvTraduccion = text
    return jsonify(EnvTraduccion), 200



# ------------------------------- OTROS ----------------------------------------
def  NewPhotoName(user):
    CountFoto = 0
    serch_user , _  = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(serch_user) == 0:
        filename = f"{user}{CountFoto}"
        return filename
    else:
         results,_ = query("SELECT COUNT(*) FROM FotoPerfil WHERE usuario_id = %s", (serch_user[0][0],))
         CountFoto = results[0][0]
         newfile = f"{user}{CountFoto}"
         return newfile

if __name__ == '__main__':
    app.run( host= '0.0.0.0' , debug=True , port=8081)