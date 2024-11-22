import MockedQueryDocumentSnapshot from "./mockedQueryDocumentSnapshot";

export default class MockedQuerySnapshot {
    public docs: MockedQueryDocumentSnapshot[];
    public empty: boolean;

    constructor(documents: MockedQueryDocumentSnapshot[]) {
        this.docs = documents;
        this.empty = this.docs.length == 0;
    }

    get size(): number {
        return this.docs.length;
    }

    // Implement the forEach method
    forEach(callback: (doc: MockedQueryDocumentSnapshot) => void): void {
        this.docs.forEach(doc => callback(doc));
    }
}
