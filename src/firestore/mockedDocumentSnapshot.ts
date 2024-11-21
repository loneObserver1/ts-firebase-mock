export default class MockedDocumentSnapshot {
    public id: string;
    private _data: Record<string, any> | null;
    private existsFlag: boolean;

    constructor(docId: string, data: Record<string, any> | null) {
        this.id = docId;
        this._data = data;
        this.existsFlag = data !== null;
    }

    exists(): boolean {
        return this.existsFlag;
    }

    data(): Record<string, any> | null {
        return this.exists() ? this._data : null;
    }

    // Récupérer un champ spécifique
    get(field: string): any {
        if (this.existsFlag && this._data) {
            return this._data[field];
        }
        throw new Error(`Field '${field}' does not exist in document '${this.id}'`);
    }
}
