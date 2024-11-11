import MockedDocumentReference from "./mockedDocumentReference";
import MockedDocumentSnapshot from "./mockedDocumentSnapshot";

export default class MockedCollection {
    private _documents: Map<string, MockedDocumentSnapshot> = new Map();
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
        if (!this._documents.has(docId)) {
            this._documents.set(docId, new MockedDocumentSnapshot(docId, {}));
        }
        return new MockedDocumentReference(docId, this);
    }

    add(data: Record<string, any>): MockedDocumentReference {
        const docId = this.generateId();
        const docRef = this.doc(docId);
        docRef.set(data);
        return docRef;
    }

    // Méthode pour appliquer les filtres et renvoyer les documents
    get(): MockedDocumentSnapshot[] {
        let docs = Array.from(this._documents.values());

        // Appliquer tous les filtres
        if (this.filters.length > 0) {
            docs = docs.filter(doc => this.filters.every(filter => filter(doc)));
        }

        // Appliquer l'ordre de tri (si défini)
        if (this.orderByField) {
            docs = docs.sort((a, b) => {
                const aValue = a.data()?.[this.orderByField!];
                const bValue = b.data()?.[this.orderByField!];
                if (this.orderByDirection === 'asc') {
                    return aValue > bValue ? 1 : -1;
                }
                return aValue < bValue ? 1 : -1;
            });
        }

        // Appliquer la limite (si définie)
        if (this.limitCount !== null) {
            docs = docs.slice(0, this.limitCount);
        }

        return docs;
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
