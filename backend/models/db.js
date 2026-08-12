const { db } = require('../config/firebase');
const { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} = require('firebase/firestore');

// Helper to check if a value matches a mongo query condition
function matchesCondition(val, cond) {
  if (cond === null || cond === undefined) {
    return val === null || val === undefined;
  }
  if (typeof cond === 'object' && !Array.isArray(cond)) {
    // MongoDB operators
    for (const op of Object.keys(cond)) {
      const condVal = cond[op];
      if (op === '$in') {
        const arr = Array.isArray(condVal) ? condVal : [condVal];
        const valArr = Array.isArray(val) ? val : [val];
        if (!valArr.some(v => arr.includes(v))) return false;
      } else if (op === '$nin') {
        const arr = Array.isArray(condVal) ? condVal : [condVal];
        const valArr = Array.isArray(val) ? val : [val];
        if (valArr.some(v => arr.includes(v))) return false;
      } else if (op === '$lte') {
        if (!(val <= condVal)) return false;
      } else if (op === '$gte') {
        if (!(val >= condVal)) return false;
      } else if (op === '$lt') {
        if (!(val < condVal)) return false;
      } else if (op === '$gt') {
        if (!(val > condVal)) return false;
      } else if (op === '$regex') {
        const flags = cond['$options'] || '';
        const regex = new RegExp(condVal, flags);
        if (!regex.test(String(val))) return false;
      } else if (op === '$exists') {
        const exists = (val !== undefined && val !== null);
        if (exists !== !!condVal) return false;
      }
    }
    return true;
  }
  if (Array.isArray(val)) {
    return val.includes(cond);
  }
  return val === cond;
}

// Helper to evaluate a full Mongo query on an in-memory document
function evaluateQuery(docData, mongoQuery) {
  if (!mongoQuery || Object.keys(mongoQuery).length === 0) return true;

  for (const key of Object.keys(mongoQuery)) {
    const val = mongoQuery[key];
    if (key === '$or') {
      if (!Array.isArray(val)) return false;
      if (!val.some(subQuery => evaluateQuery(docData, subQuery))) return false;
    } else if (key === '$and') {
      if (!Array.isArray(val)) return false;
      if (!val.every(subQuery => evaluateQuery(docData, subQuery))) return false;
    } else {
      // Path access (e.g. 'eligibility.gender')
      const path = key.split('.');
      let currentVal = docData;
      for (const part of path) {
        if (currentVal === null || currentVal === undefined) {
          currentVal = undefined;
          break;
        }
        currentVal = currentVal[part];
      }
      if (!matchesCondition(currentVal, val)) return false;
    }
  }
  return true;
}

class MockModel {
  constructor(collectionName, schemaConfig) {
    this.collectionName = collectionName;
    this.schemaConfig = schemaConfig;
  }

  async _getAll() {
    const colRef = collection(db, this.collectionName);
    const snapshot = await getDocs(colRef);
    const docs = [];
    snapshot.forEach(docSnap => {
      docs.push({
        _id: docSnap.id,
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return docs;
  }

  find(mongoQuery = {}) {
    let sortObj = null;

    const queryHelper = {
      sort: (s) => {
        sortObj = s;
        return queryHelper;
      },
      then: (resolve, reject) => {
        this._getAll()
          .then(allDocs => {
            let filtered = allDocs.filter(d => evaluateQuery(d, mongoQuery));
            if (sortObj) {
              const key = Object.keys(sortObj)[0];
              const dir = sortObj[key];
              filtered.sort((a, b) => {
                let valA = a[key];
                let valB = b[key];
                if (valA instanceof Date) valA = valA.getTime();
                if (valB instanceof Date) valB = valB.getTime();
                if (valA < valB) return dir === -1 ? 1 : -1;
                if (valA > valB) return dir === -1 ? -1 : 1;
                return 0;
              });
            }
            resolve(filtered);
          })
          .catch(reject);
      }
    };

    return queryHelper;
  }

  findOne(mongoQuery = {}) {
    const queryHelper = {
      select: (selectStr) => queryHelper,
      then: (resolve, reject) => {
        this.find(mongoQuery)
          .then(results => {
            const docData = results[0] || null;
            const wrapped = docData ? this._wrapDocument(docData) : null;
            resolve(wrapped);
          })
          .catch(reject);
      }
    };
    return queryHelper;
  }

  findById(id) {
    const queryHelper = {
      select: (selectStr) => queryHelper,
      then: (resolve, reject) => {
        if (!id) {
          resolve(null);
          return;
        }
        const docRef = doc(db, this.collectionName, String(id));
        getDoc(docRef)
          .then(docSnap => {
            const wrapped = docSnap.exists() 
              ? this._wrapDocument({ _id: docSnap.id, id: docSnap.id, ...docSnap.data() })
              : null;
            resolve(wrapped);
          })
          .catch(reject);
      }
    };
    return queryHelper;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!id) return null;
    const docRef = doc(db, this.collectionName, String(id));
    
    let updateData = update;
    if (update.$set) updateData = update.$set;

    // Remove mongoose internal attributes or functions
    delete updateData._id;
    delete updateData.id;

    await updateDoc(docRef, updateData);
    return this.findById(id);
  }

  async deleteMany(mongoQuery = {}) {
    const all = await this.find(mongoQuery);
    for (const item of all) {
      await deleteDoc(doc(db, this.collectionName, String(item._id)));
    }
    return { deletedCount: all.length };
  }

  async create(data) {
    const colRef = collection(db, this.collectionName);
    const dataToSave = { ...data };
    delete dataToSave._id;
    delete dataToSave.id;

    // Handle password hashing if defined in schema pre-save
    if (this.schemaConfig && this.schemaConfig.preSave) {
      await this.schemaConfig.preSave.call(dataToSave);
    }

    const docRef = await addDoc(colRef, dataToSave);
    return this.findById(docRef.id);
  }

  async insertMany(arr) {
    const created = [];
    for (const item of arr) {
      created.push(await this.create(item));
    }
    return created;
  }

  _wrapDocument(docData) {
    if (!docData) return null;
    const self = this;
    
    // Add Mongoose methods to the returned document object
    const docInstance = {
      ...docData,
      save: async function() {
        const docRef = doc(db, self.collectionName, String(this._id));
        const dataToSave = { ...this };
        delete dataToSave._id;
        delete dataToSave.id;
        delete dataToSave.save;
        delete dataToSave.deleteOne;
        delete dataToSave.matchPassword;

        if (self.schemaConfig && self.schemaConfig.preSave) {
          await self.schemaConfig.preSave.call(dataToSave);
        }

        await setDoc(docRef, dataToSave);
        return this;
      },
      deleteOne: async function() {
        const docRef = doc(db, self.collectionName, String(this._id));
        await deleteDoc(docRef);
        return { deletedCount: 1 };
      }
    };

    // Add Schema methods
    if (this.schemaConfig && this.schemaConfig.methods) {
      for (const methodName of Object.keys(this.schemaConfig.methods)) {
        docInstance[methodName] = this.schemaConfig.methods[methodName].bind(docInstance);
      }
    }

    return docInstance;
  }
}

// Simple Schema factory emulator
function Schema(schemaDefinition, options) {
  this.definition = schemaDefinition;
  this.options = options;
  this.preSaveFn = null;
  this.methods = {};
}

Schema.Types = {
  ObjectId: String
};

Schema.prototype.pre = function(hook, fn) {
  if (hook === 'save') {
    this.preSaveFn = fn;
  }
};

module.exports = {
  model: (name, schema) => {
    return new MockModel(name.toLowerCase() + 's', {
      preSave: schema ? schema.preSaveFn : null,
      methods: schema ? schema.methods : {}
    });
  },
  Schema,
  Types: {
    ObjectId: String
  }
};
