import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image(file_contents: bytes, filename: str):
    response = cloudinary.uploader.upload(file_contents, folder="campuscapsule")
    return {
        "url": response.get("secure_url"),
        "public_id": response.get("public_id")
    }

def delete_image(public_id: str):
    response = cloudinary.uploader.destroy(public_id)
    return response
