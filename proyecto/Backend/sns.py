import os , boto3 
from dotenv import load_dotenv

load_dotenv()
sns = boto3.client(
        'sns',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_SNS'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY_SNS'),
        region_name=os.environ.get('AWS_REGION_NAME_SNS')
    )
topic = "arn:aws:sns:us-east-1:637423543189:Publicaciones"

def subscribe(endpoint):
    protocol = "email"
    
    try:
        response = sns.subscribe(
            TopicArn=topic,
            Protocol=protocol,
            Endpoint=endpoint,
            ReturnSubscriptionArn=True
        )
        print("Suscrito a", endpoint)
    except:
        print("Error al suscribir", endpoint)

    return response

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

def unsubscribe(subscriptionArn):
    try:
        response = sns.unsubscribe(
            SubscriptionArn=subscriptionArn
        )
        response["status"] = "ok"
    except:
        print("unsuscrito")
        response["status"] = "no"
    return response