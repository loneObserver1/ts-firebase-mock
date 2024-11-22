import MockedCollection from "./mockedCollection";
import MockedDocumentSnapshot from "./mockedDocumentSnapshot";

export default class MockedDocumentReference {
    private _id: string;
    public _collection: MockedCollection;
    private snapshotListeners: Function[] = [];

    private subcollections: Map<string, MockedCollection> = new Map();

    constructor(id: string, collection: MockedCollection) {
        this._id = id;
        this._collection = collection;
    }

    onSnapshot(callback: Function): void {
        this.snapshotListeners.push(callback);
    }

    // Appeler les écouteurs lorsque des modifications sont effectuées
    set(data: Record<string, any>, options?: { merge: boolean }): void {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            const newData = options?.merge ? { ...doc.data(), ...data } : data;
            this._collection.documents.set(this.id, new MockedDocumentSnapshot(this.id, newData));
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, newData)));
        } else {
            this._collection.documents.set(this.id, new MockedDocumentSnapshot(this.id, data));
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, data)));
        }
    }

    update(data: Partial<Record<string, any>>): void {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            const updatedData = { ...doc.data(), ...data };
            this._collection.documents.set(this.id, new MockedDocumentSnapshot(this.id, updatedData));
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, data)));
        } else {
            throw new Error(`Document ${this.id} does not exist`);
        }
    }

    arrayUnion(field: string, value: any): void {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            const currentData = doc.data()!;
            const newArray = [...(currentData[field] || []), value];
            currentData[field] = newArray;
            this.update(currentData);
        }
    }

    arrayRemove(field: string, value: any): void {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            const currentData = doc.data()!;
            const newArray = (currentData[field] || []).filter((item: any) => item !== value);
            currentData[field] = newArray;
            this.update(currentData);
        }
    }

    delete(): void {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            this._collection.documents.delete(this.id);
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, null)));
        } else {
            throw new Error(`Document ${this.id} does not exist`);
        }
    }

    get(): MockedDocumentSnapshot {
        const doc = this._collection.documents.get(this.id);
        if (!doc) {
            return new MockedDocumentSnapshot(this.id, null); // Return a document with no data if not found
        }
        return doc;
    }

    // Get document id
    get id(): string {
        return this._id;
    }

    // Check if document exists
    exists(): boolean {
        const doc = this._collection.documents.get(this._id);
        return doc ? doc.exists() : false;
    }

    // Modifiez la méthode collection
    collection(collectionPath: string): MockedCollection {
        if (!this.subcollections.has(collectionPath)) {
            const newCollection = new MockedCollection(collectionPath);
            this.subcollections.set(collectionPath, newCollection);
        }
        return this.subcollections.get(collectionPath)!;
    }
}
