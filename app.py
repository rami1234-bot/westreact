import bson
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from argon2 import PasswordHasher
import os
import re
from models.user import User
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
CORS(app) 
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
jwt = JWTManager(app)

# Initialize Argon2 password hasher
ph = PasswordHasher()

# Google OAuth client ID
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')


def is_valid_email(email: str) -> bool:
    """
    Validate the format of an email address.

    Args:
        email (str): The email address to validate.

    Returns:
        bool: True if the email is valid, False otherwise.
    """
    # Compile a regex pattern for basic email validation
    email_regex = re.compile(r"[^@]+@[^@]+\.[^@]+")
    # Return whether the email matches the pattern
    return email_regex.match(email) is not None


@app.route('/register', methods=['POST'])
def register():

    print("awdawdawdawdawd")

    """
    Handle user registration.

    Expects a JSON payload with 'username', 'email', and 'password'.
    Checks if the email is valid and if the username or email already exists.
    If everything is okay, it hashes the password and stores the user in the database.

    Returns:
        A JSON response with a success message and user ID, or an error message.
    """
    # Get the JSON data from the request
    data = request.get_json()
    # Extract username, email, and password from the data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if all required fields are provided
    if not username or not email or not password:
        return jsonify({"msg": "Username, email, and password are required"}), 400

    # Validate the email format
    if not is_valid_email(email):
        return jsonify({"msg": "Invalid email format"}), 400

    # Check if the username or email already exists in the database
    existing_user = User.find_by_identifier(username) or User.find_by_identifier(email)
    if existing_user:
        return jsonify({"msg": "Username or email already exists"}), 400

    # Hash the password using Argon2
    hashed_password = ph.hash(password)
    # Create a new user and save it to the database
    new_user = User(username, email, hashed_password)
    user_id = new_user.save()

    # Return a success message with the new user's ID
    return jsonify({"msg": "User registered successfully", "id": user_id}), 201


@app.route('/login', methods=['POST'])
def login():
    """
    Handle user login.

    Expects a JSON payload with 'identifier' (username or email) and 'password'.
    Checks if the user exists and if the password is correct.
    If authentication is successful, it returns a JWT access token.

    Returns:
        A JSON response with an access token, or an error message.
    """
    # Get the JSON data from the request
    data = request.get_json()
    # Extract identifier (username or email) and password from the data
    identifier = data.get('identifier')
    password = data.get('password')

    # Check if both identifier and password are provided
    if not identifier or not password:
        return jsonify({"msg": "Identifier (username or email) and password are required"}), 400

    # Look for a user with the given username or email
    user = User.find_by_identifier(identifier)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    try:
        # Verify the provided password against the stored hash
        ph.verify(user.password_hash, password)
    except:
        # If verification fails, return an error
        return jsonify({"msg": "Invalid password"}), 401

    # Create a JWT access token for the authenticated user
    access_token = create_access_token(identity=str(user._id))
    # Update the user's last token in the database
    user.update_last_token(access_token)
    # Return the access token
    return jsonify({"access_token": access_token}), 200


@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Handle user log-out.

    This route requires a valid JWT token in the Authorization header.
    It invalidates the current token by removing it from the user's record in the database.

    Returns:
        A JSON response indicating successful log-out or an error message.
    """
    current_user_id = get_jwt_identity()

    try:
        user = User.find_by_id(current_user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Invalidate the current token
        user.update_last_token(None)

        return jsonify({"msg": "Successfully logged out."}), 200
    except Exception as e:
        return jsonify({"msg": "An error occurred during log-out", "error": str(e)}), 500


@app.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Verify the validity of the provided JWT token.

    This route checks if the token is valid and matches the last token
    saved for the user in the database.

    Returns:
        A JSON response indicating whether the token is valid or not.
    """
    # Get the user ID from the JWT
    current_user_id = get_jwt_identity()

    # Try to find user by MongoDB ObjectId first
    try:
        user = User.find_by_id(current_user_id)
    except bson.errors.InvalidId:
        # If it's not a valid ObjectId, try to find by Google ID
        user = User.find_by_google_id(current_user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Extract the current token from the Authorization header
    current_token = request.headers.get('Authorization').split()[1]
    # Check if the current token matches the last saved token
    if current_token != user.last_token:
        return jsonify({"msg": "Token is invalid or has been revoked"}), 401

    # If all checks pass, return a success message
    return jsonify({"msg": "Token is valid"}), 200


@app.route('/google-login', methods=['POST'])
def google_login():
    """
    Handle Google Sign-In.

    Expects a JSON payload with 'credential'.
    Verifies the token with Google and creates a user if not exists.
    Returns a JWT access token for the authenticated user.

    Returns:
        A JSON response with an access token, or an error message.
    """
    data = request.get_json()
    credential = data.get('credential')

    if not credential:
        return jsonify({"msg": "Credential is required"}), 400

    try:
        # Verify the credential with Google
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user information from the verified token
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')

        # Check if the user already exists in your database
        user = User.find_by_identifier(email)
        if not user:
            # If the user doesn't exist, create a new user
            new_user = User(username=name, email=email, password_hash=None, google_id=google_id)
            user_id = new_user.save()
            user = User.find_by_id(user_id)
        else:
            # If the user exists, update their Google ID
            user.google_id = google_id
            user.save()

        # Create a JWT access token for the user
        access_token = create_access_token(identity=str(user._id))
        # Update the user's last token in the database
        user.update_last_token(access_token)

        return jsonify({"access_token": access_token}), 200

    except ValueError:
        return jsonify({"msg": "Invalid token"}), 401


if __name__ == '__main__':
    app.run(debug=True)
