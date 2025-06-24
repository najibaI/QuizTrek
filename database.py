# Important MongoDB import
from pymongo import MongoClient

# Connects to my MongoDB Cluster
client = MongoClient("mongodb+srv://quiztrek:quiztrek@quiztrekcluster1.ugjvjbu.mongodb.net/")

db = client.quiztrekDB
