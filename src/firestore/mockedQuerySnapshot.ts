import MockedDocumentSnapshot from "./mockedDocumentSnapshot";

export default class MockedQuerySnapshot {
    public docs: MockedDocumentSnapshot[];
    public empty: boolean;

    constructor(documents: MockedDocumentSnapshot[]) {
        this.docs = documents;
        this.empty = this.docs.length == 0;
    }

    get size(): number {
        return this.docs.length;
    }

    // Implement the forEach method
    forEach(callback: (doc: MockedDocumentSnapshot) => void): void {
        this.docs.forEach(doc => callback(doc));
    }
}
