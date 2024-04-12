from flask import Flask, request, jsonify
from flask_cors import CORS
from db import query, query2
from encripty import hash_password
from s3 import SubirS3 ,Tranlatetext
from s3 import traerImagen
from cognito import singUp
from cognito import login_cognito
from chatbot import conversa_bot
from rekognition import detect_similitud, detect_faces,detect_text, newAlbumnstag
from io import BytesIO
from PIL import Image
import uuid

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
    try:
        user = request.form['username']
        password = request.form['password']
        name = request.form['name']
        email = request.form['email']
        
        # Contraseña hash
        password = hash_password(password)
        password = password + "D#"
        
        # Intenta registrar al usuario
        response = singUp(user, name, email, password)
        
        # Verifica si el registro fue exitoso
        if response:
            return jsonify({'mensaje': "Usuario creado"}), 200
        else:
            return jsonify({'mensaje': "Error al crear usuario"}), 400
    
    except Exception as e:
        # Captura cualquier excepción y maneja el error
        return jsonify({'error': str(e)}), 500

    
    return jsonify({'mensaje':"usuario creado"}), 200


@app.route('/login', methods=['POST'])
def api_login():
    user = request.json.get('username')
    password = request.json.get('password')

    password = hash_password(password)
    password = password + "D#"
    response = login_cognito(user, password)
    print(response)
    user_log = response['Username']
    name_log = next((item['Value'] for item in response['UserAttributes'] if item['Name'] == 'name'), None)
    email_log = next((item['Value'] for item in response['UserAttributes'] if item['Name'] == 'email'), None)
    if response == False:
        return jsonify({'mensaje': "Usuario o contraseña incorrectos"}), 400
    else:
        return jsonify({
            "mensaje":"Usuario logueado",
            "user":{
                "username":user_log,
                "name":name_log,
                "email":email_log
    
            }}), 200
    
@app.route("/prueba_base", methods=['GET'])
def prueba_base():
    query = "SELECT * FROM Usuario"
    results, _ = query2(query)
 
    print(results)
    return jsonify(results), 200



    

    
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


@app.route('/interactua_bot', methods=['POST'])
def interactua_bot():
    text = request.json.get('texto')
    sesionid = request.json.get('id_conv')
    print(sesionid)
    if sesionid == '':  # Si 'id_conv' no está presente en la solicitud
        sesionid = str(uuid.uuid4())  # Genera un UUID
    
    
    try:
        mensajes = conversa_bot(text,sesionid)
    except:
        mensajes = [
            {"content":"No podemos atender tu solicitud, pero puedes:"},
            {"content":"Recibir un cumplido"},
            {"content":"Aadoptar una mascota"},
            {"content":"Contratar un seguro"}
        ]
    response = {
        "mensajes" : mensajes,
        "id_conv" : sesionid
    }
    return response


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