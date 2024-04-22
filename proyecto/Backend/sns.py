import os , boto3 
from dotenv import load_dotenv
from db import query, query2

load_dotenv()
sns = boto3.client(
        'sns',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_SNS'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY_SNS'),
        region_name=os.environ.get('AWS_REGION_NAME_SNS')
    )
topic = "arn:aws:sns:us-east-1:637423543189:Publicaciones"

def subscribe(endpoint, usuario):
    protocol = "email"
    try:
        response = sns.subscribe(
            TopicArn=topic,
            Protocol=protocol,
            Endpoint=endpoint,
            ReturnSubscriptionArn=True
        )
        query("INSERT INTO Subscripcion(usuario, arn) VALUES (%s, %s)", (usuario,response["SubscriptionArn"]))

    except Exception as e:
        print("Error al suscribir", endpoint)
        print("Error", e);

    return response
    #return {
    #    "status":200
    #}

def publish(titulo, descripcion):
    try:
        response = sns.publish(
            TopicArn=topic, 
            Subject="Se ha publicado una nueva reseña en Destinos Inteligentes",
            Message=f'''Se ha publicado una nueva reseña que puede ser tu interés.
            {titulo}
            {descripcion}
            '''
        )
    except:
        print("Error al publicar en suscripcion")
    return response

def unsubscribe(subscriptionArn, usuario):
    try:
        response = sns.unsubscribe(
            SubscriptionArn=subscriptionArn
        )
        print(subscriptionArn)
        print("Usuario", usuario)
        query("DELETE FROM Subscripcion s WHERE usuario  = %s", (usuario,))
        response["status"] = "ok"
    except Exception as e:
        print(e)
        response["status"] = "no"
    return response

def checksubscribe(user):
    respuesta = {
        "arn":"",
        "isSub": False
    }
    try:
        response = query("SELECT arn FROM Subscripcion s WHERE usuario  = %s", (user,))
        respuesta = {
            "arn":response[0][0][0],
            "isSub": True
        }
            
    except Exception as e:
        # print(e)
        response["status"] = "no"
    return respuesta