from app import mongo
from bson import ObjectId


class Database:
    """Database utility class for common operations"""

    @staticmethod
    def get_collection(collection_name):
        """Get a MongoDB collection"""
        return mongo.db[collection_name]

    @staticmethod
    def insert_one(collection_name, document):
        """Insert a single document"""
        collection = mongo.db[collection_name]
        result = collection.insert_one(document)
        return str(result.inserted_id)

    @staticmethod
    def insert_many(collection_name, documents):
        """Insert multiple documents"""
        collection = mongo.db[collection_name]
        result = collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]

    @staticmethod
    def find_one(collection_name, query):
        """Find a single document"""
        collection = mongo.db[collection_name]
        return collection.find_one(query)

    @staticmethod
    def find_many(collection_name, query, limit=None, skip=0, sort=None):
        """Find multiple documents"""
        collection = mongo.db[collection_name]
        cursor = collection.find(query).skip(skip)

        if limit:
            cursor = cursor.limit(limit)

        if sort:
            cursor = cursor.sort(sort)

        return list(cursor)

    @staticmethod
    def update_one(collection_name, query, update):
        """Update a single document"""
        collection = mongo.db[collection_name]
        result = collection.update_one(query, update)
        return result.modified_count

    @staticmethod
    def update_many(collection_name, query, update):
        """Update multiple documents"""
        collection = mongo.db[collection_name]
        result = collection.update_many(query, update)
        return result.modified_count

    @staticmethod
    def delete_one(collection_name, query):
        """Delete a single document"""
        collection = mongo.db[collection_name]
        result = collection.delete_one(query)
        return result.deleted_count

    @staticmethod
    def delete_many(collection_name, query):
        """Delete multiple documents"""
        collection = mongo.db[collection_name]
        result = collection.delete_many(query)
        return result.deleted_count

    @staticmethod
    def count_documents(collection_name, query):
        """Count documents matching query"""
        collection = mongo.db[collection_name]
        return collection.count_documents(query)