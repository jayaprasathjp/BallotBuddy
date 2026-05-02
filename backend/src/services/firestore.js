/**
 * Firestore Service
 * Wraps Firebase Admin Firestore with reusable CRUD helpers.
 * Initializes Firebase Admin SDK once using environment credentials.
 */
const { Firestore } = require('@google-cloud/firestore');
const logger = require('./logger');

// Initialize Firestore (Native Google Cloud SDK)
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'ballotbuddy-demo',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Used in local dev
});

/**
 * Get a single document by collection + docId
 */
const getDoc = async (collection, docId) => {
  const ref = db.collection(collection).doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Get all documents in a collection (with optional ordering)
 */
const getDocs = async (collection, orderBy = null, limit = 100) => {
  let query = db.collection(collection);
  if (orderBy) query = query.orderBy(orderBy);
  if (limit) query = query.limit(limit);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Create a document (auto-generated ID)
 */
const createDoc = async (collection, data) => {
  const ref = await db.collection(collection).add({
    ...data,
    createdAt: Firestore.FieldValue.serverTimestamp(),
  });
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
};

/**
 * Set/overwrite a document by ID
 */
const setDoc = async (collection, docId, data) => {
  await db.collection(collection).doc(docId).set({
    ...data,
    updatedAt: Firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return { id: docId, ...data };
};

/**
 * Delete a document
 */
const deleteDoc = async (collection, docId) => {
  await db.collection(collection).doc(docId).delete();
};

/**
 * Query documents with a where clause
 */
const queryDocs = async (collection, field, operator, value) => {
  const snap = await db.collection(collection).where(field, operator, value).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

module.exports = { db, getDoc, getDocs, createDoc, setDoc, deleteDoc, queryDocs };
