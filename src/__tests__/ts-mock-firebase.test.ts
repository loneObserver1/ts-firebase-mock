import MockedFirestore from "../firestore/mockedFirestore";

describe('Firestore Mock Tests', () => {
    let firestore: MockedFirestore;

    beforeEach(() => {
        firestore = new MockedFirestore();
    });

    afterEach(() => {
        firestore.flush();
    })

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
        expect(allUsers.length).toBe(0);
    });

    test('should filter documents using where', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const usersAbove30 = usersCollection.where('age', '>', 30).get();

        expect(usersAbove30.length).toBe(1);
        expect(usersAbove30[0].data()).toEqual({ name: 'Charlie', age: 35 });
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

        expect(usersBetween25and35.length).toBe(3);
        expect(usersBetween25and35.map(doc => doc.data()!.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('should return empty array if no documents match where filter', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });

        const noUserAbove40 = usersCollection.where('age', '>', 40).get();

        expect(noUserAbove40.length).toBe(0);
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
        expect(allUsers.length).toBe(1);
        expect(allUsers[0].data()).toEqual({ name: 'Alice', age: 31 });
    });

    test('should retrieve specific field from document', () => {
        const usersCollection = firestore.collection('users');
        const userRef = usersCollection.add({ name: 'Alice', age: 30 });

        const userSnapshot = usersCollection.doc(userRef.id).get();
        expect(userSnapshot.exists()).toBe(true);
        expect(userSnapshot.get('name')).toBe('Alice');
        expect(userSnapshot.get('age')).toBe(30);
    });

    test('should order documents by field in ascending order', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = usersCollection.orderBy('age', 'asc').get();

        expect(orderedUsers[0].data()!.age).toBe(25);
        expect(orderedUsers[1].data()!.age).toBe(30);
        expect(orderedUsers[2].data()!.age).toBe(35);
    });

    test('should order documents by field in descending order', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const orderedUsers = usersCollection.orderBy('age', 'desc').get();

        expect(orderedUsers[0].data()!.age).toBe(35);
        expect(orderedUsers[1].data()!.age).toBe(30);
        expect(orderedUsers[2].data()!.age).toBe(25);
    });

    test('should limit the number of returned documents', () => {
        const usersCollection = firestore.collection('users');
        usersCollection.add({ name: 'Alice', age: 30 });
        usersCollection.add({ name: 'Bob', age: 25 });
        usersCollection.add({ name: 'Charlie', age: 35 });

        const limitedUsers = usersCollection.limit(2).get();

        expect(limitedUsers.length).toBe(2);
        expect(limitedUsers[0].data()!.name).toBe('Alice');
        expect(limitedUsers[1].data()!.name).toBe('Bob');
    });
});
