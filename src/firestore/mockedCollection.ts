import MockedDocumentReference from "./mockedDocumentReference";
import MockedDocumentSnapshot from "./mockedDocumentSnapshot";
import MockedQueryDocumentSnapshot from "./mockedQueryDocumentSnapshot";
import MockedQuerySnapshot from "./mockedQuerySnapshot";

export default class MockedCollection {
    private _documents: Map<string, MockedDocumentSnapshot> = new Map();
    private _documentsReferences: Map<string, MockedDocumentReference> = new Map();
    private _subcollections: Map<string, MockedCollection> = new Map();

    private name: string;
    private path: string;
    private parentDocId: string | null;
    private filters: Array<(doc: MockedDocumentSnapshot) => boolean> = [];

    private orderByField: string | null = null;
    private orderByDirection: 'asc' | 'desc' = 'asc';
    private limitCount: number | null = null;

    constructor(name: string, path: string = '', parentDocId: string | null = null) {
        this.name = name;
        this.path = path || name;
        this.parentDocId = parentDocId;
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

        if (this._documentsReferences.has(docId)) {
            return this._documentsReferences.get(docId)!;
        }

        const newDocSnapshot = new MockedDocumentSnapshot(docId, null);
        this._documents.set(docId, newDocSnapshot);

        const newDocReference = new MockedDocumentReference(docId, this);
        this._documentsReferences.set(docId, newDocReference);

        return newDocReference;
    }

    add(data: Record<string, any>): Promise<MockedDocumentReference> {
        const docId = this.generateId();
        const docRef = this.doc(docId);
        docRef.set(data);
        return Promise.resolve(docRef);
    }

    get(): Promise<MockedQuerySnapshot> {
        let docs = Array.from(this._documents.values());
    
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
        return Promise.resolve(new MockedQuerySnapshot(queryDocs));
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
                case '!=':
                    return docFieldValue !== value;
                case 'in':
                    if (!Array.isArray(value)) {
                        throw new Error(`Value for "in" operator must be an array`);
                    }
                    return value.includes(docFieldValue);
                case 'not-in':
                    if (!Array.isArray(value)) {
                        throw new Error(`Value for "not-in" operator must be an array`);
                    }
                    return !value.includes(docFieldValue);
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

    getSubcollection(name: string, parentDocId: string): MockedCollection {
        const subcollectionPath = `${this.path}/${parentDocId}/${name}`;
        if (!this._subcollections.has(subcollectionPath)) {
            const newSubcollection = new MockedCollection(name, subcollectionPath, parentDocId);
            this._subcollections.set(subcollectionPath, newSubcollection);
        }
        return this._subcollections.get(subcollectionPath)!;
    }

    deleteDocument(docId: string): void {
        // Supprimer récursivement tous les documents des sous-collections
        for (const [path, subcollection] of this._subcollections) {
            if (path.startsWith(`${this.path}/${docId}/`)) {
                // Supprimer tous les documents de la sous-collection
                for (const [subDocId] of subcollection.documents) {
                    subcollection.deleteDocument(subDocId);
                }
                this._subcollections.delete(path);
            }
        }

        this._documents.delete(docId);
        this._documentsReferences.delete(docId);
    }

    getPath(): string {
        return this.path;
    }

    isSubcollection(): boolean {
        return this.parentDocId !== null;
    }

    get documents(): Map<string, MockedDocumentSnapshot> {
        return this._documents;
    }
}
