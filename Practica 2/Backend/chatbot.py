import os , boto3 
from dotenv import load_dotenv

def conversa_bot(texto , idsesion):
    load_dotenv()
    lexbot = boto3.client(
        'lexv2-runtime',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_LEX'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY_LEX'),
        region_name=os.environ.get('AWS_REGION_NAME_LEX')
    )
    response = lexbot.recognize_text(
        botId='0DASNASAFI',  # Reemplaza con el ID del bot XT6OH4MSZF RED5JONUNV
        botAliasId='TSTALIASID',  # Reemplaza con el ID del alias
        sessionId= idsesion,  # Reemplaza con el ID de sesión
        localeId = 'es_419',
        text= texto  # Mensaje que deseas enviar al bot
    )

    return  response['messages']