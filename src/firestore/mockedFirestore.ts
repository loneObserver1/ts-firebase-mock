import MockedCollection from './mockedCollection'

export default class MockedFirestore {
    private collections: Map<string, MockedCollection> = new Map();

    collection(collectionPath: string): MockedCollection {
        if (!this.collections.has(collectionPath)) {
            this.collections.set(collectionPath, new MockedCollection(collectionPath));
        }
        return this.collections.get(collectionPath)!;
    }

    flush(): void {
        this.collections = new Map();
    }
}
