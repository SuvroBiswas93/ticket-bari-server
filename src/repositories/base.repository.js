import { connectDB, getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';
import schemaToJoi from '../utils/schemaToJoi.js';

export class BaseRepository {
  constructor(collectionName, schema = null) {
    this.collectionName = collectionName;
    this.schema = schema;
    this.joiSchema = schema ? schemaToJoi(schema) : null;
    this.joiPartialSchema = schema ? schemaToJoi(schema, { partial: true }) : null;
    connectDB();
  }
  toObjectId(id) {
    if (!id) return id;
    if (ObjectId.isValid(id) && id instanceof ObjectId) {
      return id;
    }
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return id;
  }

  convertDates(data) {
    if (!this.schema || !data) return data;
    
    const processed = { ...data };
    for (const [key, value] of Object.entries(this.schema)) {
      if (value.type === 'date' && processed[key] !== undefined && processed[key] !== null) {

        if (processed[key] instanceof Date) {
          continue;
        }

        if (typeof processed[key] === 'string') {
          const date = new Date(processed[key]);
          if (!isNaN(date.getTime())) {
            processed[key] = date;
          }
        }
      }
    }
    return processed;
  }

  getCollection() {
    const db = getDB();
    return db.collection(this.collectionName);
  }

  async create(data) {
    let payload = data;
    if (this.joiSchema) {
      const { error, value } = this.joiSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });
      payload = value;
      if (error) {
        throw new Error('Validation error: ' + error.message);
      }
    }
    const collection = this.getCollection();

    const processedData = this.convertDates(payload);

    const now = new Date();
    const item = {
      ...processedData,
      createdAt: now,
      updatedAt: now
    };
    const result = await collection.insertOne(item);
    return { ...item, _id: result.insertedId };
  }

  async createMany(dataArray) {
    const collection = this.getCollection();
    const now = new Date();
    const items = dataArray.map(data => {
      let payload = data;
      if (this.joiSchema) {
        const { error, value } = this.joiSchema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false
        });
        payload = value;
        if (error) {
          throw new Error('Validation error in createMany: ' + error.message);
        }
      }
      const processedData = this.convertDates(payload);
      return {
        ...processedData,
        createdAt: now,
        updatedAt: now
      };
    });
    const result = await collection.insertMany(items);
    return items.map((item, index) => ({
      ...item,
      _id: result.insertedIds[index]
    }));
  }

  async findById(id) {
    const collection = this.getCollection();
    const objectId = this.toObjectId(id);
    return await collection.findOne({ _id: objectId });
  }

  async findOne(filter) {
    const collection = this.getCollection();
    return await collection.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    const collection = this.getCollection();
    const {
      skip = 0,
      limit = 0,
      sort = {},
      projection = {}
    } = options;

    const cursor = collection.find(filter);
    
    if (skip) cursor.skip(skip);
    if (limit) cursor.limit(limit);
    if (Object.keys(sort).length) cursor.sort(sort);
    if (Object.keys(projection).length) cursor.project(projection);

    return await cursor.toArray();
  }

  async count(filter = {}) {
    const collection = this.getCollection();
    return await collection.countDocuments(filter);
  }

  async update(id, data) {
    if (this.joiPartialSchema) {
      const { error } = this.joiPartialSchema.validate(data, { 
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });
      if (error) {
        throw new Error('Validation error: ' + error.message);
      }
    }
    const collection = this.getCollection();
    const objectId = this.toObjectId(id);
    
    const processedData = this.convertDates(data);
    
    const updateData = {
      ...processedData,
      updatedAt: new Date()
    };
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result;
  }

  async updateOne(filter, data) {
    if (this.joiPartialSchema) {
      const { error } = this.joiPartialSchema.validate(data, { 
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });
      if (error) {
        throw new Error('Validation error: ' + error.message);
      }
    }
    const collection = this.getCollection();
    
    const processedData = this.convertDates(data);
    
    const updateData = {
      ...processedData,
      updatedAt: new Date()
    };
    const result = await collection.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result;
  }

  async updateMany(filter, data) {
    if (this.joiPartialSchema) {
      const { error } = this.joiPartialSchema.validate(data, { 
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });
      if (error) {
        throw new Error('Validation error in updateMany: ' + error.message);
      }
    }
    const collection = this.getCollection();
    
    const processedData = this.convertDates(data);
    
    const updateData = {
      ...processedData,
      updatedAt: new Date()
    };
    const result = await collection.updateMany(
      filter,
      { $set: updateData }
    );
    return result.modifiedCount;
  }

  async delete(id) {
    const collection = this.getCollection();
    const objectId = this.toObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount;
  }

  async deleteMany(filter) {
    const collection = this.getCollection();
    const result = await collection.deleteMany(filter);
    return result.deletedCount;
  }

  async exists(filter) {
    const collection = this.getCollection();
    const count = await collection.countDocuments(filter);
    return count > 0;
  }

  async aggregate(pipeline) {
    const collection = this.getCollection();
    return await collection.aggregate(pipeline).toArray();
  }
}