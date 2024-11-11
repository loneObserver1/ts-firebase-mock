import MockedFirestore from "./firestore/mockedFirestore";
import MockedFireAuth from "./fireauth/mockedFireauth";

export default class MockedFirebase {
    private mockedFirestore: MockedFirestore | null = null;
    private mockedFireAuth: MockedFireAuth | null = null;

    firestore(): MockedFirestore {
        if (!this.mockedFirestore) {
            this.mockedFirestore = new MockedFirestore();
        }
        return this.mockedFirestore;
    }

    auth(): MockedFireAuth {
        if (!this.mockedFireAuth) {
            this.mockedFireAuth = new MockedFireAuth();
        }
        return this.mockedFireAuth;
    }
}