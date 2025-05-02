import MockedDocumentSnapshot from "../firestore/mockedDocumentSnapshot";
import MockedFirestore from "../firestore/mockedFirestore";
import MockedQueryDocumentSnapshot from "../firestore/mockedQueryDocumentSnapshot";
import MockedQuerySnapshot from "../firestore/mockedQuerySnapshot";

describe('Firestore Mock Tests', () => {
    let firestore: MockedFirestore;

    beforeEach(() => {
        firestore = new MockedFirestore();
    });

    test('should create and retrieve documents', async () => {
        const usersCollection = firestore.collection('users');
        const newUser = await usersCollection.add({ name: 'Alice', age: 30 });

        const retrievedUser = await usersCollection.doc(newUser.id).get();
        expect(retrievedUser.data()).toEqual({ name: 'Alice', age: 30 });
    });

    test('should update a document', async () => {
        const usersCollection = firestore.collection('users');
        const newUser = await usersCollection.add({ name: 'Alice', age: 30 });

        await usersCollection.doc(newUser.id).update({ age: 31 });

        const updatedUser = await usersCollection.doc(newUser.id).get();
        expect(updatedUser.data()).toEqual({ name: 'Alice', age: 31 });
    });

    test('should delete a document', async () => {
        const usersCollection = firestore.collection('users');
        const newUser = await usersCollection.add({ name: 'Alice', age: 30 });

        await usersCollection.doc(newUser.id).delete();

        const allUsers = await usersCollection.get();
        expect(allUsers.size).toBe(0);
    });

    test('should filter documents using where', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });
        await usersCollection.add({ name: 'Charlie', age: 35 });

        const usersAbove30 = await usersCollection.where('age', '>', 30).get();

        expect(usersAbove30.size).toBe(1);
        expect(usersAbove30.docs[0].data()).toEqual({ name: 'Charlie', age: 35 });
    });

    test('should filter documents using multiple where clauses', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });
        await usersCollection.add({ name: 'Charlie', age: 35 });

        const usersBetween25and35 = await usersCollection
            .where('age', '>=', 25)
            .where('age', '<=', 35)
            .get();

        expect(usersBetween25and35.size).toBe(3);
        expect(usersBetween25and35.docs.map(doc => doc.data()!.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('should return empty array if no documents match where filter', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });

        const noUserAbove40 = await usersCollection.where('age', '>', 40).get();

        expect(noUserAbove40.size).toBe(0);
    });

    test('should handle complex document operations', async () => {
        const usersCollection = firestore.collection('users');
        const user1 = await usersCollection.add({ name: 'Alice', age: 30 });
        const user2 = await usersCollection.add({ name: 'Bob', age: 25 });

        await usersCollection.doc(user1.id).update({ age: 31 });
        await usersCollection.doc(user2.id).update({ age: 26 });

        const updatedUser1 = await usersCollection.doc(user1.id).get();
        const updatedUser2 = await usersCollection.doc(user2.id).get();

        expect(updatedUser1.data()).toEqual({ name: 'Alice', age: 31 });
        expect(updatedUser2.data()).toEqual({ name: 'Bob', age: 26 });

        await usersCollection.doc(user2.id).delete();
        const allUsers = await usersCollection.get();
        expect(allUsers.size).toBe(1);
        expect(allUsers.docs[0].data()).toEqual({ name: 'Alice', age: 31 });
    });

    test('should retrieve specific field from document', async () => {
        const usersCollection = firestore.collection('users');
        const userRef = await usersCollection.add({ name: 'Alice', age: 30 });

        const userSnapshot = await usersCollection.doc(userRef.id).get();
        expect(userSnapshot.exists).toBe(true);
        expect(userSnapshot.get('name')).toBe('Alice');
        expect(userSnapshot.get('age')).toBe(30);
    });

    test('should not retrieve document not exist', async () => {
        const usersCollection = firestore.collection('users');

        const userSnapshot = await usersCollection.doc('user123').get();
        expect(userSnapshot.exists).toBe(false);
        expect(userSnapshot.data()).toBe(null);

        const userSnapshot2 = await firestore.collection('products').doc('product_123').get();
        expect(userSnapshot2.exists).toBe(false);
        expect(userSnapshot2.data()).toBe(null);
    });

    test('should order documents by field in ascending order', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });
        await usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = await usersCollection.orderBy('age', 'asc').get();

        expect(orderedUsers.docs[0].data()!.age).toBe(25);
        expect(orderedUsers.docs[1].data()!.age).toBe(30);
        expect(orderedUsers.docs[2].data()!.age).toBe(35);
    });

    test('should order documents by field in descending order', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });
        await usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = await usersCollection.orderBy('age', 'desc').get();

        expect(orderedUsers.docs[0].data()!.age).toBe(35);
        expect(orderedUsers.docs[1].data()!.age).toBe(30);
        expect(orderedUsers.docs[2].data()!.age).toBe(25);
    });

    test('should limit the number of returned documents', async () => {
        const usersCollection = firestore.collection('users');
        await usersCollection.add({ name: 'Alice', age: 30 });
        await usersCollection.add({ name: 'Bob', age: 25 });
        await usersCollection.add({ name: 'Charlie', age: 35 });

        const limitedUsers = await usersCollection.limit(2).get();

        expect(limitedUsers.size).toBe(2);
        expect(limitedUsers.docs[0].data()!.name).toBe('Alice');
        expect(limitedUsers.docs[1].data()!.name).toBe('Bob');
    });

    test('should allow creating a document with subcollections', async () => {
        const col = firestore.collection('users');
        const docRef = col.doc('user1');

        const addresses = docRef.collection('addresses').doc('address1');
        await addresses.set({ city: 'Paris', zip: '75000' });

        const addressDoc = docRef.collection('addresses').doc('address1');
        const snapshot = await addressDoc.get();

        expect(snapshot.data()!.city).toBe('Paris');
        expect(snapshot.data()!.zip).toBe('75000');
    });

    test('should correctly return subcollection in nested document reference', async () => {
        const col = firestore.collection('users');
        const docRef = col.doc('user1');

        const addresses = docRef.collection('addresses').doc('address1');
        await addresses.set({ city: 'Paris', zip: '75000' });

        const subcollectionRef = docRef.collection('addresses');
        expect(subcollectionRef).toBeDefined();

        const snapshot = await subcollectionRef.doc('address1').get();
        expect(snapshot.data()!.city).toBe('Paris');
    });

    test('should allow multiple nested subcollections', async () => {
        const usersCollection = firestore.collection('users');
        const userDoc = usersCollection.doc('user1');

        const addressesCollection = userDoc.collection('addresses');
        await addressesCollection.add({ city: 'Paris', zip: '75000' });

        const reviewsCollection = addressesCollection.doc('address1').collection('reviews');
        await reviewsCollection.add({ review: 'Great place!', rating: 5 });

        const reviewSnapshot = await reviewsCollection.get();

        expect(reviewSnapshot.size).toBe(1);
        expect(reviewSnapshot.docs[0].data()!.review).toBe('Great place!');
        expect(reviewSnapshot.docs[0].data()!.rating).toBe(5);
    });

    test('should handle nested subcollections correctly', async () => {
        const usersCollection = firestore.collection('users');
        const userDoc = usersCollection.doc('user1');
        
        const addressesCollection = userDoc.collection('addresses');
        const addressDoc = addressesCollection.doc('address1');
        await addressDoc.set({ city: 'Paris', zip: '75000' });
        
        const retrievedAddress = await addressesCollection.doc('address1').get();
        expect(retrievedAddress.data()).toEqual({ city: 'Paris', zip: '75000' });
        
        await userDoc.delete();
        
        const deletedAddress = await addressesCollection.doc('address1').get();
        expect(deletedAddress.exists).toBe(false);
    });

    test('should handle multiple levels of subcollections', async () => {
        const usersCollection = firestore.collection('users');
        const userDoc = usersCollection.doc('user1');
        
        const ordersCollection = userDoc.collection('orders');
        const orderDoc = ordersCollection.doc('order1');
        await orderDoc.set({ total: 100 });
        
        const itemsCollection = orderDoc.collection('items');
        await itemsCollection.doc('item1').set({ name: 'Product 1', price: 50 });
        
        const retrievedOrder = await ordersCollection.doc('order1').get();
        expect(retrievedOrder.data()).toEqual({ total: 100 });
        
        const retrievedItems = await itemsCollection.get();
        expect(retrievedItems.size).toBe(1);
        expect(retrievedItems.docs[0].data()).toEqual({ name: 'Product 1', price: 50 });
    });

    test('should handle collection paths correctly', async () => {
        const usersCollection = firestore.collection('users');
        const userDoc = usersCollection.doc('user1');
        const addressesCollection = userDoc.collection('addresses');
        
        expect(addressesCollection.getPath()).toBe('users/user1/addresses');
        expect(addressesCollection.isSubcollection()).toBe(true);
    });
});
