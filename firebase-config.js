// Firebaseコンソールの「プロジェクトの設定」→「マイアプリ」に表示される値へ置き換えてください。
// この設定値はWebアプリに公開される前提の識別情報です。パスワードや秘密鍵は絶対に書かないでください。
var firebaseConfig = {
    apiKey: "AIzaSyATzdX_g4h3AEblWV9NpzMaHhm49l2E_bM",
    authDomain: "jorinbo-survivor.firebaseapp.com",
    projectId: "jorinbo-survivor",
    storageBucket: "jorinbo-survivor.firebasestorage.app",
    messagingSenderId: "864823220006",
    appId: "1:864823220006:web:06d3f76d9e4348cc6093e7"
};

var isFirebaseConfigured = !Object.values(firebaseConfig).some(value =>
    typeof value !== 'string' || value.includes('PASTE_YOUR_')
);
var auth = null;
var db = null;

if (isFirebaseConfigured) {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
    } catch (error) {
        isFirebaseConfigured = false;
        console.error('Firebaseの初期化に失敗しました。firebase-config.jsを確認してください。', error);
    }
}
