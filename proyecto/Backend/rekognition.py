import boto3
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import os
import requests
from io import BytesIO
from PIL import Image
import base64
load_dotenv()
myaccesid = os.getenv('AWS_ACCESS_KEY_ID')
myregion = os.getenv('AWS_REGION_NAME')
mysecret = os.getenv('AWS_SECRET_ACCESS_KEY')

rekognition = boto3.client('rekognition', 
                   aws_access_key_id=myaccesid, 
                   aws_secret_access_key=mysecret, 
                   region_name=myregion)


def detect_similitud(image1_url, image2_data):
    try:
        # Descargar la imagen desde la URL
        response = requests.get(image1_url)
        if response.status_code != 200:
            print("Error al descargar la imagen de la URL")
            return None

        image1 = Image.open(BytesIO(response.content))


        image2 = Image.open(BytesIO(image2_data))


        if image2.mode == 'RGBA':
            image2 = image2.convert('RGB')

        image1_bytes = BytesIO()
        image1.save(image1_bytes, format='JPEG')
        image1_bytes.seek(0)

        image2_bytes = BytesIO()
        image2.save(image2_bytes, format='JPEG')
        image2_bytes.seek(0)

        # Comparar las caras en las imágenes
        response = rekognition.compare_faces(
            SourceImage={
                'Bytes': image1_bytes.read()
            },
            TargetImage={
                'Bytes': image2_bytes.read()
            },
            SimilarityThreshold=10,
        )
        return response

    except Exception as e:
        print("Error al comparar caras:", e)
        return False
    
def detect_faces(image):
    try:
        response = requests.get(image)
        if response.status_code != 200:
            print("Error al descargar la imagen de la URL")
            return None

        image1 = Image.open(BytesIO(response.content))

        image1_bytes = BytesIO()
        image1.save(image1_bytes, format='JPEG')
        image1_bytes.seek(0)

    

        # Comparar las caras en las imágenes
        response = rekognition.detect_faces(
            Image={
                'Bytes': image1_bytes.read()
            },
            Attributes=['ALL']
  
        )
        return response

    except Exception as e:
        print("Error al comparar caras:", e)
        return False
    
def detect_text( image2_data):
    try:
        image2 = Image.open(BytesIO(image2_data))
        if image2.mode == 'RGBA':
            image2 = image2.convert('RGB')

        image2_bytes = BytesIO()
        image2.save(image2_bytes, format='JPEG')
        image2_bytes.seek(0)
        response = rekognition.detect_text(
            Image={
                'Bytes': image2_bytes.read()
            }
            
        )
        
        
        # Comparar las caras en las imágenes
        return response

    except Exception as e:
        print("Error al comparar caras:", e)
        return False
    


def newAlbumnstag (image_data):
  
    response = rekognition.detect_labels(
        Image={
            'Bytes': image_data.read()
        }
    )
    etiquetas = [label['Name'] for label in response['Labels']]
    return etiquetas
    

