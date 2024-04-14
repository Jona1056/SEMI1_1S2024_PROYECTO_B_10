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
    reseña = request.form['reseña']
    Pais = request.form['Pais']
    imageS3 = request.files['image2']
    imageR = request.files['image']
    photoName = "Foto"
    
    results, _ = query2("SELECT COUNT(*) FROM Publicacion")
    photoName = photoName + str(results[0][0])
    TipeFormat = imageS3.filename.split(".")[-1]
    NewName = f"{photoName}.{TipeFormat}"
    imageS3.filename = NewName
    print(NewName)


    ListaAlbums = newAlbumnstag(imageR) 
    lista_albumns_traducidos = []
    for albun in ListaAlbums:
        album = Tranlatetext(albun,"ES")
        lista_albumns_traducidos.append(album)
    
    existe, _ = query("SELECT id FROM Pais WHERE nombre = %s", (Pais,))
    if existe:
        print("El país ya existe en la base de datos.")
        id_pais = existe[0][0]  # Obtén el ID del país existente
    else:
        print("El país no existe en la base de datos. Se agregará.")
        _, id_pais = query("INSERT INTO Pais (nombre, bandera) VALUES (%s, %s)", (Pais, ""))
    ##verificar si ya existe el pais 
    query("INSERT INTO Publicacion (descripcion, foto, estrellas, pais_id) VALUES (%s, %s, %s, %s)",
      (reseña, imageS3.filename, 0, id_pais))
    #obtener id para el album
    select_id_foto, _  = query("SELECT id FROM Publicacion WHERE foto = %s",(imageS3.filename,))
    for album in lista_albumns_traducidos:
    # Verificar si el álbum ya existe
     
        _, id_album = query("INSERT INTO Album (nombre) VALUES (%s)", (album,))
    
    
    # Asociar album a la publicacion
        query("UPDATE Album SET publicacion_id = %s WHERE id = %s", (select_id_foto[0][0], id_album))



    SubirS3(f"Fotos_Publicadas/{NewName}", imageS3)
   
    return jsonify({'message': "Foto subida exitosamente"}), 200

@app.route('/publicaciones', methods=['GET'])
def get_publicaciones():
    query_sql = """
        SELECT 
       Publicacion.id AS publicacion_id,
       Publicacion.descripcion AS descripcion_publicacion,
       Publicacion.foto AS foto_publicacion,
       Publicacion.estrellas AS estrellas_publicacion,
       Comentario.id AS comentario_id,
       Comentario.descripcion AS descripcion_comentario,
       Comentario.usuario AS usuario_comentario,
       Comentario.estrellas AS comentario_estrellas,
       Pais.nombre AS nombre_pais
   FROM Publicacion
   LEFT JOIN Comentario ON Publicacion.id = Comentario.publicacion_id
   LEFT JOIN Pais ON Publicacion.pais_id = Pais.id;
    """
    results = query2(query_sql)
    print(results)
    
    # Estructuramos los resultados en una lista de diccionarios donde cada diccionario contiene la información de la publicación y sus comentarios
    publicaciones_con_comentarios = {}
    for row in results[0]:  # Iteramos solo sobre la lista de tuplas, sin considerar el segundo elemento de results
        publicacion_id = row[0]  # Accedemos al ID de la publicación
        descripcion_publicacion = row[1]  # Accedemos a la descripción de la publicación
        foto_publicacion = row[2]  # Accedemos a la foto de la publicación
        estrellas_publicacion = row[3]  # Accedemos a las estrellas de la publicación
        comentario_id = row[4]  # Accedemos al ID del comentario
        descripcion_comentario = row[5]  # Accedemos a la descripción del comentario
        nombre_pais = row[8]  # Accedemos al nombre del país
        usuario_comentario = row[6]
        usuario_estrellas = row[7]
        
        # Si la publicación no está en el diccionario, la agregamos con una lista vacía de comentarios
        if publicacion_id not in publicaciones_con_comentarios:
            publicaciones_con_comentarios[publicacion_id] = {
                "publicacion": {
                    "id": publicacion_id,
                    "descripcion": descripcion_publicacion,
                    "foto": foto_publicacion,
                    "estrellas": estrellas_publicacion,
                    "nombre_pais": nombre_pais # Añadimos el nombre del país aquí
                   
                },
                "comentarios": []
            }
        
        # Si hay un comentario asociado a la publicación, lo agregamos a la lista de comentarios de esa publicación
        if comentario_id is not None:
            publicaciones_con_comentarios[publicacion_id]["comentarios"].append({
                "id": comentario_id,
                "descripcion": descripcion_comentario,
                 "nombre_usuario": usuario_comentario,
                    "estrellas_usuario": usuario_estrellas
            })
    
    # Convertimos el diccionario en una lista para que sea compatible con JSON
    resultado_final = list(publicaciones_con_comentarios.values())
    
    print(resultado_final)
    return jsonify(resultado_final), 200





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