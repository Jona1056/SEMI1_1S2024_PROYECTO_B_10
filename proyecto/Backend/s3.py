import os , boto3 
from dotenv import load_dotenv

def SubirS3(namefoto , foto):

    load_dotenv()
    s3 = boto3.resource(
        's3',
        aws_access_key_id=os.environ.get('ENV_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('ENV_AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('ENV_AWS_REGION_NAME')
        )
    
    s3.Bucket(
        os.environ.get('ENV_AWS_S3_BUCKET_NAME')
    ).put_object(
        Key=namefoto,
        Body=foto,
        ContentType='image'
    )

def traerImagen(namefoto):
    load_dotenv()
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.environ.get('ENV_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('ENV_AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('ENV_AWS_REGION_NAME')
        )
    url = s3.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': os.environ.get('ENV_AWS_S3_BUCKET_NAME'),
            'Key': namefoto
        }
    )
    return url


def Tranlatetext(texto , idioma):
    load_dotenv()
    translate = boto3.client(
        'translate',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_TRANSLATE'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY_TRANSLATE'),
        region_name=os.environ.get('AWS_REGION_NAME_TRANSLATE')
    )
    response = translate.translate_text(
        Text=texto,
        SourceLanguageCode="auto",
        TargetLanguageCode=idioma
    )

    return  response['TranslatedText']