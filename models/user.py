from pymongo import MongoClient
from bson import ObjectId
import os

# Set up MongoDB connection
mongo_uri = os.environ.get('MONGO_URI', 'mongodb+srv://eitankorh123:Eg77MRaRjCw2GxVy@cluster0.vljul.mongodb.net/')
client = MongoClient(mongo_uri)
db = client['roofmate']
users_collection = db['users']


class User:
    def __init__(self, username, email, password_hash, last_token=None, _id=None, google_id=None):
        """
        Initialize a User object.

        Args:
            username (str): The user's username.
            email (str): The user's email address.
            password_hash (str): The hashed password of the user.
            last_token (str, optional): The last JWT token issued to the user.
            _id (ObjectId, optional): The MongoDB ObjectId of the user.
        """
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.last_token = last_token
        self._id = _id
        self.google_id = google_id


    @classmethod
    def find_by_identifier(cls, identifier):
        """
        Find a user by their username or email.

        Args:
            identifier (str): The username or email to search for.

        Returns:
            User: A User object if found, None otherwise.
        """
        user_data = users_collection.find_one({"$or": [{"username": identifier}, {"email": identifier}]})
        if user_data:
            return cls(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data['password'],
                last_token=user_data.get('last_token'),
                _id=user_data['_id'],
                google_id=user_data.get('google_id')
            )
        return None

    @classmethod
    def find_by_id(cls, user_id):
        """
        Find a user by their ID.

        Args:
            user_id (str): The ID of the user to find.

        Returns:
            User: A User object if found, None otherwise.
        """
        user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return cls(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data['password'],
                last_token=user_data.get('last_token'),
                google_id=user_data.get('google_id'),
                _id=user_data['_id']
            )
        return None
    
    @classmethod
    def find_by_google_id(cls, google_id):
        """
        Find a user by their Google ID.

        Args:
            google_id (str): The Google ID of the user to find.

        Returns:
            User: A User object if found, None otherwise.
        """
        user_data = users_collection.find_one({"google_id": google_id})
        if user_data:
            return cls(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data.get('password'),
                last_token=user_data.get('last_token'),
                google_id=user_data.get('google_id'),
                _id=user_data['_id']
            )
        return None

    def save(self):
        """
        Save the user to the database.

        If the user already exists, update their information.
        If the user is new, insert them into the database.

        Returns:
            str: The ID of the user in the database.
        """
        user_data = {
            "username": self.username,
            "email": self.email,
            "password": self.password_hash,
            "last_token": self.last_token,
            "google_id": self.google_id
        }
        if self._id:
            users_collection.update_one({"_id": self._id}, {"$set": user_data})
        else:
            result = users_collection.insert_one(user_data)
            self._id = result.inserted_id
        return str(self._id)

    def update_last_token(self, token):
        """
        Update the user's last token in the database.

        Args:
            token (str): The new JWT token to save.
        """
        self.last_token = token
        users_collection.update_one({"_id": self._id}, {"$set": {"last_token": token}})
