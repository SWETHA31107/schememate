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
      if (op === '$options') continue; // handled by $regex
      const condVal = cond[op];
      if (op === '$in') {
        const arr = Array.isArray(condVal) ? condVal : [condVal];
        const valArr = Array.isArray(val) ? val : [val];
        if (!valArr.some(v => arr.includes(v))) return false;
      } else if (op === '$nin') {
        const arr = Array.isArray(condVal) ? condVal : [condVal];
        const valArr = Array.isArray(val) ? val : [val];
        if (valArr.some(v => arr.includes(v))) return false;
      } else if (op === '$ne') {
        if (val === condVal) return false;
      } else if (op === '$eq') {
        if (val !== condVal) return false;
      } else if (op === '$lte') {
        if (val === undefined || val === null || !(val <= condVal)) return false;
      } else if (op === '$gte') {
        if (val === undefined || val === null || !(val >= condVal)) return false;
      } else if (op === '$lt') {
        if (val === undefined || val === null || !(val < condVal)) return false;
      } else if (op === '$gt') {
        if (val === undefined || val === null || !(val > condVal)) return false;
      } else if (op === '$regex') {
        const flags = cond['$options'] || '';
        const regex = new RegExp(condVal, flags);
        if (!regex.test(String(val || ''))) return false;
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

// Helpers to strip internal methods from document before saving to Firestore
const INTERNAL_KEYS = ['_id', 'id', 'save', 'deleteOne', 'toObject', 'isModified', 'isNew'];

function cleanForSave(obj, schemaMethodNames) {
  const clean = {};
  const skipKeys = new Set([...INTERNAL_KEYS, ...(schemaMethodNames || [])]);
  for (const key of Object.keys(obj)) {
    if (skipKeys.has(key)) continue;
    if (typeof obj[key] === 'function') continue;
    clean[key] = obj[key];
  }
  return clean;
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
    let limitNum = null;

    const queryHelper = {
      sort: (s) => {
        sortObj = s;
        return queryHelper;
      },
      limit: (n) => {
        limitNum = n;
        return queryHelper;
      },
      select: (s) => queryHelper,
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
            if (limitNum) {
              filtered = filtered.slice(0, limitNum);
            }
            resolve(filtered);
          })
          .catch(reject);
      }
    };

    return queryHelper;
  }

  findOne(mongoQuery = {}) {
    const self = this;
    const queryHelper = {
      select: (selectStr) => queryHelper,
      then: (resolve, reject) => {
        self.find(mongoQuery)
          .then(results => {
            const docData = results[0] || null;
            const wrapped = docData ? self._wrapDocument(docData) : null;
            resolve(wrapped);
          })
          .catch(reject);
      }
    };
    return queryHelper;
  }

  findById(id) {
    const self = this;
    const queryHelper = {
      select: (selectStr) => queryHelper,
      then: (resolve, reject) => {
        if (!id) {
          resolve(null);
          return;
        }
        const docRef = doc(db, self.collectionName, String(id));
        getDoc(docRef)
          .then(docSnap => {
            const wrapped = docSnap.exists() 
              ? self._wrapDocument({ _id: docSnap.id, id: docSnap.id, ...docSnap.data() })
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

    const cleaned = cleanForSave(updateData, Object.keys(this.schemaConfig.methods || {}));
    await updateDoc(docRef, cleaned);
    return this.findById(id);
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const existing = await this.findById(id);
    if (!existing) return null;
    const docRef = doc(db, this.collectionName, String(id));
    await deleteDoc(docRef);
    return existing;
  }

  async deleteMany(mongoQuery = {}) {
    const all = await this.find(mongoQuery);
    for (const item of all) {
      await deleteDoc(doc(db, this.collectionName, String(item._id)));
    }
    return { deletedCount: all.length };
  }

  async countDocuments(mongoQuery = {}) {
    const all = await this.find(mongoQuery);
    return all.length;
  }

  async aggregate(pipeline = []) {
    let docs = await this._getAll();
    
    for (const stage of pipeline) {
      if (stage.$match) {
        docs = docs.filter(d => evaluateQuery(d, stage.$match));
      } else if (stage.$group) {
        const groupKey = stage.$group._id;
        const groups = {};
        for (const d of docs) {
          // Resolve group key (e.g. "$category")
          const keyField = groupKey.startsWith('$') ? groupKey.slice(1) : groupKey;
          const keyVal = d[keyField] || 'unknown';
          if (!groups[keyVal]) groups[keyVal] = [];
          groups[keyVal].push(d);
        }
        // Build aggregation results
        docs = Object.entries(groups).map(([key, items]) => {
          const result = { _id: key };
          for (const [field, op] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (op.$sum === 1) result[field] = items.length;
            else if (typeof op.$sum === 'string' && op.$sum.startsWith('$')) {
              const sumField = op.$sum.slice(1);
              result[field] = items.reduce((acc, i) => acc + (i[sumField] || 0), 0);
            }
          }
          return result;
        });
      } else if (stage.$sort) {
        const key = Object.keys(stage.$sort)[0];
        const dir = stage.$sort[key];
        docs.sort((a, b) => {
          if (a[key] < b[key]) return dir === -1 ? 1 : -1;
          if (a[key] > b[key]) return dir === -1 ? -1 : 1;
          return 0;
        });
      } else if (stage.$limit) {
        docs = docs.slice(0, stage.$limit);
      }
    }
    return docs;
  }

  async create(data) {
    const colRef = collection(db, this.collectionName);
    const dataToSave = { ...data };
    delete dataToSave._id;
    delete dataToSave.id;

    // Simulate isModified for pre-save hooks
    const modifiedFields = Object.keys(dataToSave);
    dataToSave.isModified = (field) => modifiedFields.includes(field);

    // Handle password hashing if defined in schema pre-save
    if (this.schemaConfig && this.schemaConfig.preSave) {
      await this.schemaConfig.preSave.call(dataToSave);
    }

    // Clean before saving
    delete dataToSave.isModified;

    const docRef = await addDoc(colRef, dataToSave);
    return this._wrapDocument({ _id: docRef.id, id: docRef.id, ...dataToSave });
  }

  async insertMany(arr) {
    const colRef = collection(db, this.collectionName);
    const created = [];
    for (const item of arr) {
      const dataToSave = { ...item };
      delete dataToSave._id;
      delete dataToSave.id;

      const modifiedFields = Object.keys(dataToSave);
      dataToSave.isModified = (field) => modifiedFields.includes(field);

      if (this.schemaConfig && this.schemaConfig.preSave) {
        await this.schemaConfig.preSave.call(dataToSave);
      }
      delete dataToSave.isModified;

      const docRef = await addDoc(colRef, dataToSave);
      created.push({ _id: docRef.id, id: docRef.id, ...dataToSave });
    }
    return created;
  }

  _wrapDocument(docData) {
    if (!docData) return null;
    const self = this;
    const methodNames = Object.keys(this.schemaConfig.methods || {});
    
    // Track which fields have been modified since load
    const originalData = { ...docData };
    const modifiedSet = new Set();

    const docInstance = {
      ...docData,
      isModified: function(field) {
        return modifiedSet.has(field);
      },
      isNew: false,
      toObject: function() {
        return cleanForSave(this, methodNames);
      },
      save: async function() {
        const docRef = doc(db, self.collectionName, String(this._id));
        
        if (self.schemaConfig && self.schemaConfig.preSave) {
          await self.schemaConfig.preSave.call(this);
        }

        const dataToSave = cleanForSave(this, methodNames);
        await setDoc(docRef, dataToSave);
        // Reset modified tracking
        modifiedSet.clear();
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
      for (const methodName of methodNames) {
        docInstance[methodName] = this.schemaConfig.methods[methodName].bind(docInstance);
      }
    }

    // Create a Proxy to track field modifications
    const proxy = new Proxy(docInstance, {
      set(target, prop, value) {
        if (prop !== '_id' && prop !== 'id' && typeof prop === 'string' && !INTERNAL_KEYS.includes(prop)) {
          if (target[prop] !== value) {
            modifiedSet.add(prop);
          }
        }
        target[prop] = value;
        return true;
      }
    });

    return proxy;
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
