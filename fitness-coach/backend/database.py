import os
from pymongo import MongoClient  # type: ignore
from dotenv import load_dotenv  # type: ignore
from bson import ObjectId  # type: ignore

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fitness_coach_db")

# 1. In-Memory Mock Datastore for fast offline development
class MockCollection:
    def __init__(self):
        self.docs = {}

    def insert_one(self, doc):
        doc = doc.copy()
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.docs[doc["_id"]] = doc
        class Result:
            inserted_id = doc["_id"]
        return Result()

    def find_one(self, filter_dict):
        if isinstance(filter_dict, ObjectId):
            filter_dict = {"_id": filter_dict}
            
        for doc in self.docs.values():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None

    def find(self, filter_dict):
        matches = []
        for doc in self.docs.values():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matches.append(doc.copy())
        
        class MockCursor(list):
            def sort(self, key, direction=1):
                super().sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
                return self
        return MockCursor(matches)

    def delete_one(self, filter_dict):
        to_del = []
        for oid, doc in self.docs.items():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                to_del.append(oid)
        
        for oid in to_del:
            del self.docs[oid]
            
        class Result:
            deleted_count = len(to_del)
        return Result()

    def update_one(self, filter_dict, update_dict, upsert=False):
        matched_oid = None
        for oid, doc in self.docs.items():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched_oid = oid
                break
                
        if matched_oid:
            if "$set" in update_dict:
                self.docs[matched_oid].update(update_dict["$set"])
        elif upsert:
            doc = filter_dict.copy()
            if "$set" in update_dict:
                doc.update(update_dict["$set"])
            if "_id" not in doc:
                doc["_id"] = ObjectId()
            self.docs[doc["_id"]] = doc
            
        class Result:
            modified_count = 1 if matched_oid else 0
        return Result()

# 2. Connection establishment with automatic fallback
try:
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
    # Trigger a ping command to force immediate connection evaluation
    client.admin.command('ping')
    db = client[DB_NAME]
    
    users_collection = db["users"]
    workouts_collection = db["workouts"]
    goals_collection = db["goals"]
    print("[OK] Connected to MongoDB successfully.")
except Exception as e:
    print("[WARNING] MongoDB connection offline (refused). Falling back to In-Memory Datastore.")
    users_collection = MockCollection()
    workouts_collection = MockCollection()
    goals_collection = MockCollection()

def get_db():
    return None
