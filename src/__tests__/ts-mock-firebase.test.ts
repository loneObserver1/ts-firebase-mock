import MockedDocumentSnapshot from "../firestore/mockedDocumentSnapshot";
import MockedFirestore from "../firestore/mockedFirestore";
import MockedQueryDocumentSnapshot from "../firestore/mockedQueryDocumentSnapshot";
import MockedQuerySnapshot from "../firestore/mockedQuerySnapshot";

describe('Firestore Mock Tests', () => {
    let firestore: MockedFirestore;

    beforeEach(() => {
        firestore = new MockedFirestore();
    });

    test('should create and retrieve documents', () => {
        const usersCollection = firestore.collection('users');
        const newUser = usersCollection.add({ name: 'Alice', age: 30 });

        const retrievedUser = usersCollection.doc(newUser.id).get();
        expect(retrievedUser.data()).toEqual({ name: 'Alice', age: 30 });
    });

    test('should update a document', () => {
        const usersCollection = firestore.collection('users');
        const newUser = usersCollection.add({ name: 'Alice', age: 30 });

        // Mise à jour du document
        usersCollection.doc(newUser.id).update({ age: 31 });

        const updatedUser = usersCollection.doc(newUser.id).get();
        expect(updatedUser.data()).toEqual({ name: 'Alice', age: 31 });
    });

    test('should delete a document', () => {
        const usersCollection = firestore.collection('users');
        const newUser = usersCollection.add({ name: 'Alice', age: 30 });

        // Suppression du document
        usersCollection.doc(newUser.id).delete();

        const allUsers = usersCollection.get();
        expect(allUsers.size).toBe(0);
    });

    test('should filter documents using where', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const usersAbove30 = usersCollection.where('age', '>', 30).get();

        expect(usersAbove30.size).toBe(1);
        expect(usersAbove30.docs[0].data()).toEqual({ name: 'Charlie', age: 35 });
    });

    test('should filter documents using multiple where clauses', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const usersBetween25and35 = usersCollection
            .where('age', '>=', 25)
            .where('age', '<=', 35)
            .get();

        expect(usersBetween25and35.size).toBe(3);
        expect(usersBetween25and35.docs.map(doc => doc.data()!.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('should return empty array if no documents match where filter', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });

        const noUserAbove40 = usersCollection.where('age', '>', 40).get();

        expect(noUserAbove40.size).toBe(0);
    });


    test('should handle complex document operations', () => {
        const usersCollection = firestore.collection('users');
        const user1 = usersCollection.add({ name: 'Alice', age: 30 });
        const user2 = usersCollection.add({ name: 'Bob', age: 25 });

        // Update both documents
        usersCollection.doc(user1.id).update({ age: 31 });
        usersCollection.doc(user2.id).update({ age: 26 });

        // Verify updated documents
        const updatedUser1 = usersCollection.doc(user1.id).get();
        const updatedUser2 = usersCollection.doc(user2.id).get();

        expect(updatedUser1.data()).toEqual({ name: 'Alice', age: 31 });
        expect(updatedUser2.data()).toEqual({ name: 'Bob', age: 26 });

        // Delete one document and check the length
        usersCollection.doc(user2.id).delete();
        const allUsers = usersCollection.get();
        expect(allUsers.size).toBe(1);
        expect(allUsers.docs[0].data()).toEqual({ name: 'Alice', age: 31 });
    });

    test('should retrieve specific field from document', () => {
        const usersCollection = firestore.collection('users');
        const userRef = usersCollection.add({ name: 'Alice', age: 30 });

        const userSnapshot = usersCollection.doc(userRef.id).get();
        expect(userSnapshot.exists).toBe(true);
        expect(userSnapshot.get('name')).toBe('Alice');
        expect(userSnapshot.get('age')).toBe(30);
    });

    test('should not retrieve document not exist', () => {
        const usersCollection = firestore.collection('users');

        const userSnapshot = usersCollection.doc('user123').get();
        expect(userSnapshot.exists).toBe(false);
        expect(userSnapshot.data()).toBe(null);

        const userSnapshot2 = firestore.collection('products').doc('product_123').get();
        expect(userSnapshot2.exists).toBe(false);
        expect(userSnapshot2.data()).toBe(null);
    });

    test('should order documents by field in ascending order', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = usersCollection.orderBy('age', 'asc').get();

        expect(orderedUsers.docs[0].data()!.age).toBe(25);
        expect(orderedUsers.docs[1].data()!.age).toBe(30);
        expect(orderedUsers.docs[2].data()!.age).toBe(35);
    });

    test('should order documents by field in descending order', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = usersCollection.orderBy('age', 'desc').get();

        expect(orderedUsers.docs[0].data()!.age).toBe(35);
        expect(orderedUsers.docs[1].data()!.age).toBe(30);
        expect(orderedUsers.docs[2].data()!.age).toBe(25);
    });

    test('should limit the number of returned documents', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const limitedUsers = usersCollection.limit(2).get();

        expect(limitedUsers.size).toBe(2);
        expect(limitedUsers.docs[0].data()!.name).toBe('Alice');
        expect(limitedUsers.docs[1].data()!.name).toBe('Bob');
    });

    it('should allow creating a document with subcollections', () => {
        const col = firestore.collection('users');
        const docRef = col.doc('user1');

        // Create subcollection "addresses" within the document
        const addresses = docRef.collection('addresses').doc('address1');
        addresses.set({ city: 'Paris', zip: '75000' });

        const addressDoc = docRef.collection('addresses').doc('address1');
        const snapshot = addressDoc.get();

        expect(snapshot.data()!.city).toBe('Paris');
        expect(snapshot.data()!.zip).toBe('75000');
    });

    it('should correctly return subcollection in nested document reference', () => {
        const col = firestore.collection('users');
        const docRef = col.doc('user1');

        // Add a subcollection to this document
        const addresses = docRef.collection('addresses').doc('address1');
        addresses.set({ city: 'Paris', zip: '75000' });

        const subcollectionRef = docRef.collection('addresses');
        expect(subcollectionRef).toBeDefined();

        const snapshot = subcollectionRef.doc('address1').get();
        expect(snapshot.data()!.city).toBe('Paris');
    });

    it('should allow multiple nested subcollections', () => {
        const usersCollection = firestore.collection('users');
        const userDoc = usersCollection.doc('user1');

        // First level subcollection
        const addressesCollection = userDoc.collection('addresses');
        addressesCollection.add({ city: 'Paris', zip: '75000' });

        // Second level subcollection under addresses
        const reviewsCollection = addressesCollection.doc('address1').collection('reviews');
        reviewsCollection.add({ review: 'Great place!', rating: 5 });

        const reviewSnapshot = reviewsCollection.get();

        expect(reviewSnapshot.size).toBe(1);
        expect(reviewSnapshot.docs[0].data()!.review).toBe('Great place!');
        expect(reviewSnapshot.docs[0].data()!.rating).toBe(5);
    });

    test('should return the correct data of documents in the query snapshot', () => {
        const docs = [
            new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 }),
            new MockedQueryDocumentSnapshot('doc2', { name: 'Bob', age: 25 })
        ];
        const querySnapshot = new MockedQuerySnapshot(docs);

        expect(querySnapshot.docs[0].data().name).toBe('Alice');
        expect(querySnapshot.docs[1].data().age).toBe(25);
    });

    test('should return the correct data of documents using get() field in the query snapshot', () => {
        const docs = [
            new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 }),
            new MockedQueryDocumentSnapshot('doc2', { name: 'Bob', age: 25 }),
            new MockedQueryDocumentSnapshot('doc3', null)
        ];
        const querySnapshot = new MockedQuerySnapshot(docs);

        expect(querySnapshot.docs[0].get('name')).toBe('Alice');
        expect(querySnapshot.docs[0].get('city')).toBe(null);
        expect(querySnapshot.docs[2].get('region')).toBe(null);
        expect(querySnapshot.docs[2].data()).toEqual({});
    });

    test('should return the correct data of documents using get() field in the query snapshot', () => {
        const docs = [
            new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 }),
            new MockedQueryDocumentSnapshot('doc2', { name: 'Bob', age: 25 })
        ];
        const querySnapshot = new MockedQuerySnapshot(docs);

        expect(querySnapshot.docs[0].get('name')).toBe('Alice');
        expect(querySnapshot.docs[0].get('city')).toBe(null);
    });

    test('should return the correct size of documents in the query snapshot', () => {
        const docs = [
            new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 }),
            new MockedQueryDocumentSnapshot('doc2', { name: 'Bob', age: 25 })
        ];
        const querySnapshot = new MockedQuerySnapshot(docs);

        expect(querySnapshot.size).toBe(2);
    });

    test('should return empty as true if there are no documents', () => {
        const querySnapshot = new MockedQuerySnapshot([]);

        expect(querySnapshot.empty).toBe(true);
    });

    test('should return empty as false if there are documents', () => {
        const docs = [new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 })];
        const querySnapshot = new MockedQuerySnapshot(docs);

        expect(querySnapshot.empty).toBe(false);
    });

    test('should iterate over all documents using forEach', () => {
        const docs = [
            new MockedQueryDocumentSnapshot('doc1', { name: 'Alice', age: 30 }),
            new MockedQueryDocumentSnapshot('doc2', { name: 'Bob', age: 25 })
        ];
        const querySnapshot = new MockedQuerySnapshot(docs);

        const result: string[] = [];
        querySnapshot.forEach(doc => {
            result.push(doc.id);
        });

        expect(result).toEqual(['doc1', 'doc2']);
    });

    test('should return document in subcollection using document reference', async () => {
        // Définition des valeurs à rechercher
        const mockEventId = 'event1';
        const mockReductionName = 'reduction50';

        // Initialisation des données pour ce test
        const eventsCollection = firestore.collection('events');

        // Création de l'événement
        await eventsCollection.doc(mockEventId).set({
            uid: mockEventId,
            statusEvent: 'end',
            billingUrl: null,
            billingDate: new Date('2023-01-01')
        });

        // Ajout de la réduction dans la sous-collection 'coupons'
        await eventsCollection.doc(mockEventId).collection('coupons').doc('coupon1').set({
            name: mockReductionName,
            discount: 50
        });

        // Appel à la fonction qui va récupérer la réduction
        const querySnapshot = await firestore.collection('events')
            .doc(mockEventId)
            .collection('coupons')
            .where('name', '==', mockReductionName)
            .limit(1)
            .get();

        // Vérification des résultats
        expect(querySnapshot.docs.length).toBe(1); // Au moins une réduction doit être trouvée
        expect(querySnapshot.docs[0].data().name).toBe(mockReductionName); // Vérification du nom de la réduction
    });

    test('should filter documents using != operator', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const not30YearsOld = usersCollection.where('age', '!=', 30).get();

        expect(not30YearsOld.size).toBe(2);
        expect(not30YearsOld.docs.map(doc => doc.data()!.name)).toEqual(['Bob', 'Charlie']);
    });

    test('should filter documents using in operator', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const agesIn = usersCollection.where('age', 'in', [25, 35]).get();

        expect(agesIn.size).toBe(2);
        expect(agesIn.docs.map(doc => doc.data()!.name)).toEqual(['Bob', 'Charlie']);
    });

    test('should filter documents using not-in operator', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const agesNotIn = usersCollection.where('age', 'not-in', [30, 35]).get();

        expect(agesNotIn.size).toBe(1);
        expect(agesNotIn.docs.map(doc => doc.data()!.name)).toEqual(['Bob']);
    });

    test('should throw error when using in operator with non-array value', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });

        expect(() => {
            usersCollection.where('age', 'in', 30).get(); // Value is not an array
        }).toThrow('Value for "in" operator must be an array');
    });

    test('should throw error when using not-in operator with non-array value', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });

        expect(() => {
            usersCollection.where('age', 'not-in', 30).get(); // Value is not an array
        }).toThrow('Value for "not-in" operator must be an array');
    });

    test('should work with multiple where clauses including !=, in, and not-in', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });
        usersCollection.add({ name: 'Diana', age: 40 });

        const complexQuery = usersCollection
            .where('age', '!=', 30)
            .where('age', 'in', [25, 35, 40])
            .where('age', 'not-in', [35])
            .get();

        expect(complexQuery.size).toBe(2);
        expect(complexQuery.docs.map(doc => doc.data()!.name)).toEqual(['Bob', 'Diana']);
    });
});
