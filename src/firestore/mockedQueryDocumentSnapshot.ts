export default class MockedQueryDocumentSnapshot {
    private _data: Record<string, any> | null = null;
    public exists: boolean;
    public id: string;

    constructor(docId: string, data: Record<string, any> | null) {
        this.id = docId;
        this._data = data;
        this.exists = data !== null;
    }

    get(key: string): any | null {
        if (this._data == null) {
            return null;
        }
        return this._data[key] !== undefined ? this._data[key] : null;
    }

    data(): Record<string, any> {
        return this._data ?? {};  // Si _data est null, renvoie un objet vide
    }
}