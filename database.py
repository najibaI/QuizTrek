# Important MongoDB import
from pymongo import MongoClient

# Connects to my MongoDB Cluster
client = MongoClient("mongodb+srv://<db_username>:<db_password>@quiztrekcluster1.ugjvjbu.mongodb.net/")

db = client.quiztrekDB
