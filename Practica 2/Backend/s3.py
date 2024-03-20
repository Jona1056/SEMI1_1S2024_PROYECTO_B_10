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
