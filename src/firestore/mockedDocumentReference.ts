import MockedCollection from "./mockedCollection";
import MockedDocumentSnapshot from "./mockedDocumentSnapshot";

export default class MockedDocumentReference {
    private _id: string;
    public _collection: MockedCollection;
    private snapshotListeners: Function[] = [];

    constructor(id: string, collection: MockedCollection) {
        this._id = id;
        this._collection = collection;
    }

    get id(): string {
        return this._id;
    }

    set(data: Record<string, any>, options?: { merge: boolean }): Promise<void> {
        const doc = this._collection.documents.get(this.id);
        if (doc) {
            const newData = options?.merge ? { ...doc.data(), ...data } : data;
            this._collection.documents.set(this.id, new MockedDocumentSnapshot(this.id, newData));
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, newData)));
        } else {
            this._collection.documents.set(this.id, new MockedDocumentSnapshot(this.id, data));
            this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, data)));
        }
        return Promise.resolve();
    }

    update(data: Record<string, any>): Promise<void> {
        const doc = this._collection.documents.get(this.id);
        if (!doc) {
            throw new Error(`Document ${this.id} does not exist`);
        }
        const currentData = doc.data() || {};
        const newData = { ...currentData, ...data };
        return this.set(newData);
    }

    delete(): Promise<void> {
        this._collection.deleteDocument(this.id);
        this.snapshotListeners.forEach(listener => listener(new MockedDocumentSnapshot(this.id, null)));
        return Promise.resolve();
    }

    onSnapshot(listener: (snapshot: MockedDocumentSnapshot) => void): () => void {
        this.snapshotListeners.push(listener);
        const currentDoc = this._collection.documents.get(this.id);
        if (currentDoc) {
            listener(currentDoc);
        }
        return () => {
            this.snapshotListeners = this.snapshotListeners.filter(l => l !== listener);
        };
    }

    collection(collectionPath: string): MockedCollection {
        return this._collection.getSubcollection(collectionPath, this.id);
    }

    get(): Promise<MockedDocumentSnapshot> {
        const doc = this._collection.documents.get(this.id);
        if (!doc) {
            return Promise.resolve(new MockedDocumentSnapshot(this.id, null));
        }
        return Promise.resolve(doc);
    }

    exists(): boolean {
        const doc = this._collection.documents.get(this._id);
        return doc ? doc.exists : false;
    }
}
