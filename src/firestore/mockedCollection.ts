import MockedDocumentReference from "./mockedDocumentReference";
import MockedDocumentSnapshot from "./mockedDocumentSnapshot";
import MockedQueryDocumentSnapshot from "./mockedQueryDocumentSnapshot";
import MockedQuerySnapshot from "./mockedQuerySnapshot";

export default class MockedCollection {
    private _documents: Map<string, MockedDocumentSnapshot> = new Map();
    private _documentsReferences: Map<string, MockedDocumentReference> = new Map();

    private name: string;
    private filters: Array<(doc: MockedDocumentSnapshot) => boolean> = [];

    private orderByField: string | null = null;
    private orderByDirection: 'asc' | 'desc' = 'asc';
    private limitCount: number | null = null;

    constructor(name: string) {
        this.name = name;
    }

    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
        this.orderByField = field;
        this.orderByDirection = direction;
        return this;
    }

    limit(count: number): this {
        this.limitCount = count;
        return this;
    }

    doc(docId?: string): MockedDocumentReference {
        if (!docId) {
            docId = this.generateId();
        }

        // Si le document existe déjà, retournez la référence existante
        if (this._documentsReferences.has(docId)) {
            return this._documentsReferences.get(docId)!;
        }

        // Sinon, créez un nouveau document avec des données vides
        const newDocSnapshot = new MockedDocumentSnapshot(docId, {});
        this._documents.set(docId, newDocSnapshot);

        const newDocReference = new MockedDocumentReference(docId, this);
        this._documentsReferences.set(docId, newDocReference);

        return newDocReference;
    }

    add(data: Record<string, any>): MockedDocumentReference {
        const docId = this.generateId();
        const docRef = this.doc(docId);
        docRef.set(data);
        return docRef;
    }

    // Méthode pour appliquer les filtres et renvoyer les documents
    get(): MockedQuerySnapshot {
        let docs = Array.from(this._documents.values());

        // Reste de votre logique existante de filtrage, tri, etc.
        if (this.filters.length > 0) {
            docs = docs.filter(doc => this.filters.every(filter => filter(doc)));
        }

        if (this.orderByField) {
            docs = docs.sort((a, b) => {
                const aValue = a.data()?.[this.orderByField!];
                const bValue = b.data()?.[this.orderByField!];
                return this.orderByDirection === 'asc'
                    ? (aValue > bValue ? 1 : -1)
                    : (aValue < bValue ? 1 : -1);
            });
        }

        if (this.limitCount !== null) {
            docs = docs.slice(0, this.limitCount);
        }

        const queryDocs = docs.map(doc => new MockedQueryDocumentSnapshot(doc.id, doc.data()));
        return new MockedQuerySnapshot(queryDocs);
    }

    where(field: string, operator: string, value: any): this {
        const filter = (doc: MockedDocumentSnapshot) => {
            const docData = doc.data();
            const docFieldValue = docData ? docData[field] : undefined;

            switch (operator) {
                case '==':
                    return docFieldValue === value;
                case '>':
                    return docFieldValue > value;
                case '<':
                    return docFieldValue < value;
                case '>=':
                    return docFieldValue >= value;
                case '<=':
                    return docFieldValue <= value;
                default:
                    throw new Error(`Operator ${operator} not supported`);
            }
        };

        this.filters.push(filter);
        return this;
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    get documents(): Map<string, MockedDocumentSnapshot> {
        return this._documents;
    }
}
