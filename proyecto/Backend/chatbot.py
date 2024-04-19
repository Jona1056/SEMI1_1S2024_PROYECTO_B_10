import os , boto3 
from dotenv import load_dotenv
from db import query, query2

def conversa_bot(texto , idsesion):
    load_dotenv()
    print("en conversacion bot")
    lexbot = boto3.client(
        'lexv2-runtime',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_LEX'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY_LEX'),
        region_name=os.environ.get('AWS_REGION_NAME_LEX')
    )
    print("conexion")
    response = lexbot.recognize_text(
        botId='TA0WVGJB7H',
        botAliasId='TSTALIASID',
        sessionId= idsesion,
        localeId = 'es_US',
        text= texto  
    )
    #print("response before")
    #print(response)
    intent = response['sessionState']['intent']['name']
    confirmationState = response['sessionState']['intent']['confirmationState']
    slots = response['sessionState']['intent']['slots']
    mensajeFinal = {
                "contentType": "PlainText",
                "content": f'Puedes hacer otra consulta si lo deseas.',
                }
    
    print(">>", intent, confirmationState, slots)

    if intent == "BuscarPorEstrellas":
        if confirmationState == "Confirmed":
            estrellas = slots['Estrellas']['value']['resolvedValues'][0]
            print("Estrellas:", estrellas)

            # buscar lugares con esta cantidad de estrellas
            lugares = busca_estrellas(estrellas)

            # provisional
            #lugares = [[1, "hotel1"], [2, "hotel2"], [3, "hotel3"]]

            # mensaje inicial
            response['messages'] = [{
                "contentType": "PlainText",
                "content": f'Los lugares con {estrellas} estrellas son:',
                }]
            # mensajes para cada lugar
            for i in lugares:
                response['messages'].append({
                "contentType": "PlainText",
                "content": f'{i[1]}',
                })
            # mensaje end of chat
            response['messages'].append(mensajeFinal)
    elif intent== "Paises":
        if confirmationState == "Confirmed":
            #paises = ["Pais1", "Pais2", "Pais3"]
            paises = busca_paises()
            # mensaje inicial
            response['messages'] = [{
                "contentType": "PlainText",
                "content": f'Los países mejor calificados son:',
                }]
            # mensajes para cada pais
            for i in paises:
                response['messages'].append({
                "contentType": "PlainText",
                "content": f'{i[0]}',
                })
            # mensaje end of chat
            response['messages'].append(mensajeFinal)
            #response['sessionState']['intent']['state'] = "Fulfilled"
    else:
        response['messages'] = [
            {"content":"No podemos atender tu solicitud, pero puedes:"},
            {"content":"Buscar lugares dependiendo de su numero de estrellas"},
            {"content":"Buscar los países mejor calificados"}
        ]

    #print("mensajes en chatbot")
    #print(response['messages'])
    return response

def busca_estrellas(estrellas):
    consulta = "SELECT id, TRIM(descripcion)  FROM Publicacion p WHERE estrellas = %s"
    resultado, _ = query(consulta, (estrellas,))
    return resultado

def busca_paises():
    consulta = "SELECT p.nombre, AVG(p2.estrellas) AS promedio FROM Pais p INNER JOIN Publicacion p2 ON p.id =p2.pais_id GROUP BY p.nombre ORDER BY promedio DESC LIMIT 5"
    print(consulta)
    resultado, _ = query2(consulta,)
    return resultado