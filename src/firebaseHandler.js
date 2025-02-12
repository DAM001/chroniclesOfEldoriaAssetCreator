/* Add this code to your html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-storage-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
*/

const firebaseHandler = {
    db: null,
    auth: null,
    provider: null,
    storage: null,
    doLog: true,

    initialize(config) {
        firebase.initializeApp(config);
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.log('Firebase initialized successfully!');
    },

    /* DATABASE */

    async createDocument(collection, id, data) {
        this.validateInputs(collection, id, data);
        return this.setDocument(`${collection}/${id}`, data, 'Document created successfully!');
    },

    async saveDocument(collection, id, data) {
        this.validateInputs(collection, id, data);
        return this.setDocument(`${collection}/${id}`, data, 'Document saved successfully!');
    },

    async setDocument(path, data, successMessage) {
        try {
            await this.db.doc(path).set(data);
            this.log(successMessage);
        } catch (error) {
            return this.handleError(error);
        }
    },

    async loadDocument(collection, id) {
        try {
            const doc = await this.db.collection(collection).doc(id).get();
            if (!doc.exists) throw new Error('Document not found!');
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async loadAllDocuments(collection) {
        const snapshot = await this.db.collection(collection).get();
        return snapshot.empty ? [] : snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    onDocumentChange(path, callback) {
        return this.onChange(this.db.doc(path), callback);
    },

    onCollectionChange(collection, callback) {
        return this.onChange(this.db.collection(collection), callback);
    },

    onChange(ref, callback) {
        return ref.onSnapshot(snapshot => {
            const data = snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : { id: snapshot.id };
            callback({ type: snapshot.exists ? 'modified' : 'removed', data });
        }, this.handleError);
    },

    async addSubCollection(collection, id, subCollection, data) {
        this.validateInputs(collection, id, subCollection, data);
        try {
            const docRef = await this.db.collection(collection).doc(id).collection(subCollection).add(data);
            this.log(`Subcollection document created with ID: ${docRef.id}`);
        } catch (error) {
            return this.handleError(error);
        }
    },

    async deleteDocument(collection, id) {
        try {
            await this.db.doc(`${collection}/${id}`).delete();
            this.log(`Document successfully deleted: ${collection}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    },

    /* STORAGE */

    async uploadFile(filePath, file) {
        const storageRef = this.storage.ref(filePath);
        try {
            const snapshot = await storageRef.put(file);
            const url = await snapshot.ref.getDownloadURL();
            this.log(`File uploaded successfully! Location: ${url}`);
            return url;
        } catch (error) {
            return this.handleError(error);
        }
    },

    async getFileURL(filePath) {
        try {
            const url = await this.storage.ref(filePath).getDownloadURL();
            this.log(`File URL retrieved: ${url}`);
            return url;
        } catch (error) {
            return this.handleError(error);
        }
    },

    async deleteFile(filePath) {
        try {
            await this.storage.ref(filePath).delete();
            this.log(`File successfully deleted: ${filePath}`);
        } catch (error) {
            return this.handleError(error);
        }
    },

    /* AUTHENTICATION */

    async googleSignIn() {
        try {
            const result = await this.auth.signInWithPopup(this.provider);
            this.log(`Google Sign-In successful: ${result.user.email}`);
            return result.user;
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signUpWithEmail(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            this.log(`User created with email: ${userCredential.user.email}`);
            return userCredential.user;
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signInWithEmail(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.log(`Sign-In successful for email: ${userCredential.user.email}`);
            return userCredential.user;
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signOut() {
        try {
            await this.auth.signOut();
            this.log('User signed out successfully!');
        } catch (error) {
            return this.handleError(error);
        }
    },

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            this.log(`Password reset email sent to: ${email}`);
        } catch (error) {
            return this.handleError(error);
        }
    },

    /* HELPERS */

    generateRandomId(length = 20) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    validateInputs(...inputs) {
        inputs.forEach(input => {
            if (!input) throw new Error('Invalid input provided!');
        });
    },

    handleError(error) {
        console.error(error);
        return null;
    },

    log(message) {
        if (this.doLog) {
            console.log(message);
        }
    }
};