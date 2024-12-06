export default class MockedDocumentSnapshot {
    public id: string;
    protected _data: Record<string, any> | null = null;
    private existsFlag: boolean;

    constructor(docId: string, data: Record<string, any> | null) {
        this.id = docId;
        this._data = data;
        this.existsFlag = data !== null && Object.keys(data).length > 0;
    }

    get exists(): boolean {
        return this.existsFlag;
    }

    data(): Record<string, any> | null {
        return this.exists ? this._data : null;
    }

    // Récupérer un champ spécifique
    get(field: string): any {
        if (this.existsFlag && this._data) {
            return this._data[field];
        }
        throw new Error(`Field '${field}' does not exist in document '${this.id}'`);
    }
}
