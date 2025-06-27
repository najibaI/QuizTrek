# Important MongoDB import
from pymongo import MongoClient

# Connects to my MongoDB Cluster
# Obiviously, not showing my DB username and password for confidential reasons
client = MongoClient("mongodb+srv://<db_username>:<db_password>@quiztrekcluster1.ugjvjbu.mongodb.net/")

db = client.quiztrekDB
