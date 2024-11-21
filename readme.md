# ts-firebase-mock

[![Node.js CI](https://github.com/loneObserver1/ts-firebase-mock/actions/workflows/nodejs.yml/badge.svg)](https://github.com/loneObserver1/ts-firebase-mock/actions/workflows/nodejs.yml)

`ts-firebase-mock` is a TypeScript library designed to simulate Firestore (a NoSQL cloud database from Firebase) for testing purposes. This package mimics Firestore's core functionality, allowing developers to write unit tests without requiring a real Firestore instance. It operates entirely in-memory, providing a lightweight solution for testing Firestore interactions locally.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating a Firebase Mock Instance](#creating-a-firebase-mock-instance)
  - [Adding Documents](#adding-documents)
  - [Retrieving Documents](#retrieving-documents)
  - [Filtering with `where`](#filtering-with-where)
  - [Sorting with `orderBy`](#sorting-with-orderby)
  - [Limiting Results with `limit`](#limiting-results-with-limit)
  - [Document References & Snapshots](#document-references--snapshots)
  - [Listening to Document Changes](#listening-to-document-changes)
  - [Updating Documents](#updating-documents)
  - [Using arrays](#using-arrays)
- [API Reference](#api-reference)
  - [FirestoreMock](#firestoremock)
  - [MockedCollection](#mockedcollection)
  - [MockedDocumentReference](#mockeddocumentreference)
  - [MockedDocumentSnapshot](#mockeddocumentsnapshot)
- [Example](#example)
- [License](#license)

## Installation

You can install `ts-firebase-mock` via npm or yarn.

```bash
npm install ts-firebase-mock
or
yarn add ts-firebase-mock
```
## Usage
### Creating a Firebase Mock Instance
To create a mock Firestore instance, simply instantiate the FirestoreMock class. This will simulate Firestore's collection and document behavior.
```typescript
import { MockedFirebase } from 'ts-firebase-mock';

// Create associate mocked
const firebase = new MockedFirebase();

const firestore = firebase.firestore();
const fireauth = firebase.auth();
```
## Adding Documents
You can add documents to collections and subcollections using the add method. Each document will have a unique ID generated by default.
```typescript
// Collections
const usersCollection = firestore.collection('users');
usersCollection.add({ name: 'Alice', age: 30 });
usersCollection.add({ name: 'Bob', age: 25 });

// Subcollections
const usersCollection = firestore.collection('users');
const userDocRef = usersCollection.doc('user1');
// Adding a document to a subcollection under the 'user1' document
const addressesCollection = userDocRef.collection('addresses');
addressesCollection.add({ city: 'Paris', zip: '75000' });

// Also subcollections
const reviewsCollection = addressesCollection.doc('address1').collection('reviews');
reviewsCollection.add({ review: 'Great place!', rating: 5 });
```

## Retrieving Documents
To retrieve documents, you can call get() on a collection. This will return all documents in the collection.
```typescript
const users = usersCollection.get();
console.log(users);  // Output: [MockedDocumentSnapshot, MockedDocumentSnapshot]
```

## Filtering with where
You can filter documents using the where method, which allows you to specify field values, operators, and the value to filter by. It supports operators like ==, >, <, >=, and <=.
```typescript
const filteredUsers = usersCollection.where('age', '>', 30).get();
console.log(filteredUsers.length);  // Output: 1 (users with age > 30)
```

## Sorting with orderBy
To sort the results of a query, use the orderBy method, which allows sorting by a specified field in ascending or descending order.
```typescript
const orderedUsers = usersCollection.orderBy('age', 'desc').get();
console.log(orderedUsers[0].data().age);  // Output: 30 (highest age)
```

## Limiting Results with limit
You can limit the number of documents returned by a query using the limit method.
```typescript
const limitedUsers = usersCollection.limit(1).get();
console.log(limitedUsers.length);  // Output: 1
```

## Document References & Snapshots
Each document in a collection has a reference via the doc() method, and you can retrieve a snapshot of the document with the get() method.
```typescript
const userDocRef = usersCollection.doc('user-id');
const userDoc = userDocRef.get();
console.log(userDoc.data());  // Output: { name: 'Alice', age: 30 }
```

## Using arrays
The arrayUnion and arrayRemove methods are used to modify array fields within a document.
```typescript
// Add a new user with interests
const userDocRef = usersCollection.doc('user-id');
userDocRef.set({ name: 'Daisy', interests: ['reading', 'swimming'] });

// Use arrayUnion to add a new interest without duplicating existing values
userDocRef.arrayUnion('interests', 'coding');
console.log(userDocRef.get().data().interests); // Output: ['reading', 'swimming', 'coding']

// Use arrayUnion again to attempt adding an existing interest
userDocRef.arrayUnion('interests', 'swimming');
console.log(userDocRef.get().data().interests); // Output remains: ['reading', 'swimming', 'coding']

// Use arrayRemove to remove an interest
userDocRef.arrayRemove('interests', 'reading');
console.log(userDocRef.get().data().interests); // Output: ['swimming', 'coding']

```

## Listening to Document Changes
You can listen for real-time updates on a document using the onSnapshot method. This method accepts a callback function that gets called whenever the document is updated.
```typescript
const userDocRef = usersCollection.doc('user-id');
userDocRef.onSnapshot((docSnapshot) => {
  console.log(docSnapshot.data());  // Output: updated data of the document
});
```

## Updating Documents
You can update a document using the set method on a document reference. The set method allows for data replacement or merging depending on the provided options.
```typescript
// Update document data
userDocRef.update({ age: 41 });

// Replace document data
userDocRef.set({ name: 'Charlie', age: 40 });

// Merge document data
userDocRef.set({ age: 41 }, { merge: true });

```

# API Reference
FirestoreMock
The main class that simulates Firestore functionality.
### MockedCollection
Simulates a Firestore collection of documents.

#### Methods:

- `add(data: Record<string, any>): MockedDocumentReference` - Adds a document to the collection.
- `get(): MockedDocumentSnapshot[]` - Retrieves all documents in the collection.
- `where(field: string, operator: string, value: any): this` - Filters documents by field values.
- `orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this` - Orders documents by field value.
- `limit(count: number): this` - Limits the number of documents returned by the query.
- `doc(id: string): MockedDocumentReference`- Retrieves a document reference by ID.

### MockedDocumentReference
Represents a reference to a document.

#### Methods:
- `set(data: Record<string, any>, options?: { merge: boolean }): void` - Sets data for the document, with an option to merge.
- `get(): MockedDocumentSnapshot` - Retrieves a snapshot of the document.
- `update(data: Partial<Record<string, any>>): void``` - Update document
- `arrayUnion(field: string, value: any): void` - Adds a value to an array field in the document, avoiding duplicates.
- `arrayRemove(field: string, value: any): void` - Removes a value from an array field in the document, if it exists.
- `delete(): void` - Deletes the document.
- `onSnapshot(callback: Function): void` - Adds a listener for document changes.
- `exists(): boolean` - Return if document exist

### MockedDocumentSnapshot
Represents a snapshot of a document retrieved from a collection.

#### Methods:
- `data(): Record<string, any>` - Retrieves the document data.
- `exists(): boolean` - Return if document is exist
- `get(field: string): any` - Return specific field in document

### MockedFirestore
Represents a mocked firestore.

#### Methods:
- `collection(collectionPath: string): MockedCollection` - Retreive or create collection with name
- `flush(): void` - Flush all datas in mocked firestore

### Example
Here’s a complete example showing how you can use ts-firebase-mock to add, retrieve, and update documents:
```typescript
import { MockedFirebase } from 'ts-firebase-mock';

// Create associate mocked
const firebase = new MockedFirebase();

const firestore = firebase.firestore();
const fireauth = firebase.auth();

// Create a collection
const usersCollection = firestore.collection('users');

// Add some users
usersCollection.add({ name: 'Alice', age: 30 });
usersCollection.add({ name: 'Bob', age: 25 });
usersCollection.add({ name: 'Charlie', age: 35 });

// Retrieve all users
const users = usersCollection.get();
console.log(users);  // Output: [MockedDocumentSnapshot, MockedDocumentSnapshot, MockedDocumentSnapshot]

// Filter users above age 30
const usersAbove30 = usersCollection.where('age', '>', 30).get();
console.log(usersAbove30.length);  // Output: 1 (Only Charlie)

// Order users by age in descending order
const orderedUsers = usersCollection.orderBy('age', 'desc').get();
console.log(orderedUsers[0].data());  // Output: { name: 'Charlie', age: 35 }

// Limit the results to 2 users
const limitedUsers = usersCollection.limit(2).get();
console.log(limitedUsers.length);  // Output: 2

// Update a user
const userDocRef = usersCollection.doc('user-id');
userDocRef.set({ age: 31 }, { merge: true });

// Delete a user
const deleteUserDocRef = usersCollection.doc('user-to-remove').delete();
```

### License
This project is licensed under the MIT License - see the LICENSE file for details.
