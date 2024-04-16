from flask import Flask, request, jsonify  ,  send_file
from flask_cors import CORS
from db import query, query2
from encripty import hash_password
from s3 import SubirS3 ,Tranlatetext , TextToVoz
from s3 import traerImagen
from cognito import singUp
from cognito import login_cognito
from chatbot import conversa_bot
from rekognition import detect_similitud, detect_faces,detect_text, newAlbumnstag
from io import BytesIO
from PIL import Image
import uuid
import requests

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
    

    return jsonify(resultado_final), 200



@app.route('/addcoment', methods=['POST'])
def api_add_coment():
    data = request.get_json()

    id_publicacion = data['idpublicacion']
    estrellas = data['estrellas']
    comentario = data['comentario']
    usuario = data['idusuario']
    #agregar query
    query("INSERT INTO Comentario (descripcion, estrellas, usuario, publicacion_id) VALUES (%s, %s, %s, %s)",
      (comentario, estrellas, usuario, id_publicacion))
    return jsonify({'message': "Comentario agregado exitosamente"}), 200

@app.route('/updatestar', methods=['POST'])
def api_update_star():
    data = request.get_json()
    id_publicacion = data['idpublicacion']
    estrellas = data['estrellas']
    ##acutlaizar en tabla
    query("UPDATE Publicacion SET estrellas = %s WHERE id = %s", (estrellas, id_publicacion))
    return jsonify({'message': "Estrellas actualizadas exitosamente"}), 200
    

@app.route('/findalbum', methods=['GET'])
def find_album():
    filtro = request.args.get('filtro', '')
   
    query_albums = "SELECT * FROM Album WHERE nombre LIKE %s"
    albums_results, _ = query(query_albums, (f"%{filtro}%",))

# Paso 2: Buscar publicaciones asociadas a los álbumes encontrados
    publicaciones_con_comentarios = {}

    for album in albums_results:
        album_id = album[2]
        query_publicaciones = """
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
    LEFT JOIN Pais ON Publicacion.pais_id = Pais.id
    WHERE Publicacion.id = %s;
    """
        publicaciones_results, _ = query(query_publicaciones, (album_id,))

        for row in publicaciones_results:
            publicacion_id = row[0]  # Accedemos al ID de la publicación
            descripcion_publicacion = row[1]  # Accedemos a la descripción de la publicación
            foto_publicacion = row[2]  # Accedemos a la foto de la publicación
            estrellas_publicacion = row[3]  # Accedemos a las estrellas de la publicación
            comentario_id = row[4]  # Accedemos al ID del comentario
            descripcion_comentario = row[5]  # Accedemos a la descripción del comentario
            nombre_pais = row[8]  # Accedemos al nombre del país
            usuario_comentario = row[6]
            usuario_estrellas = row[7]
    
        # Usamos una tupla (publicacion_id, album_id) como clave en el diccionario
            key = (publicacion_id, album_id)
        # Si la clave no está en el diccionario, la agregamos con una lista vacía de comentarios
            if key not in publicaciones_con_comentarios:
                publicaciones_con_comentarios[key] = {
                "publicacion": {
                    "id": publicacion_id,
                    "descripcion": descripcion_publicacion,
                    "foto": foto_publicacion,
                    "estrellas": estrellas_publicacion,
                    "nombre_pais": nombre_pais  # Añadimos el nombre del país aquí
                },
                "comentarios": []
            }
        
        # Si hay un comentario asociado a la publicación, lo agregamos a la lista de comentarios de esa publicación
            if comentario_id is not None and comentario_id not in [comentario["id"] for comentario in publicaciones_con_comentarios[key]["comentarios"]]:
                publicaciones_con_comentarios[key]["comentarios"].append({
                "id": comentario_id,
                "descripcion": descripcion_comentario,
                "nombre_usuario": usuario_comentario,
                "estrellas_usuario": usuario_estrellas
            })

# Convertimos el diccionario en una lista para que sea compatible con JSON
    resultado_final = [value for value in publicaciones_con_comentarios.values()]

    print(resultado_final)
    return jsonify(resultado_final), 200


@app.route('/TraduccionAutomatica', methods=['POST'])
def pruebatraductor():

    url_api = 'https://3q2fwrjp5d.execute-api.us-east-1.amazonaws.com/traducirtexto'

    texto = request.json.get('texto')
    idioma = request.json.get('idioma')
    
    response = requests.post(url_api, json={'texto': texto, 'idioma': idioma})
 
    if response.status_code == 200:
        datos = response.json()
        return jsonify(datos)
    
    return jsonify({'error': 'No se pudo traducir el texto'}), 500



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



@app.route('/TextToVoz', methods=['POST'])
def api_text_to_voz():
    text = request.json.get('texto')
    idioma = request.json.get('idioma')

    traductor = ""
    if idioma == 'en':
        traductor = "Joanna"
    elif idioma == 'zh':
        traductor = "Zhiyu"
    elif idioma == 'da':
        traductor = "Vicki"
    else:
        traductor = "Lucia"

    TextToVoz(traductor , text)

    return send_file('speech.mp3', mimetype='audio/mpeg')
   
if __name__ == '__main__':
    app.run( host= '0.0.0.0' , debug=True , port=8081)