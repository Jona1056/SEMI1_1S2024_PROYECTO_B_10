import boto3
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import os
import requests
load_dotenv()

myuserpoolid = os.getenv('AWS_USER_POOL_ID_COGNITO')
client_id = os.getenv('AWS_ACCES_CLIENT_ID_COGNITO')

cognito = boto3.client('cognito-idp',
                       region_name= 'us-east-1'
                       )
           

def singUp(user,name,email,password):
    try:
        response = cognito.sign_up(
            ClientId=client_id,
            Username=user,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'name',
                    'Value': name
                },
                {
                    'Name': 'email',
                    'Value': email
                }
            ]
        )
        return response
    except Exception as e:
        print("Error al registrar usuario:", e)
        return False

def login_cognito(user,password):
    try:
        response = cognito.initiate_auth(
            ClientId=client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': user,
                'PASSWORD': password
            }
        )
        access_token = response["AuthenticationResult"]["AccessToken"]
        response = cognito.get_user(AccessToken=access_token)
        return response
    except Exception as e:
        print("Error al iniciar sesión:", e)
        return False