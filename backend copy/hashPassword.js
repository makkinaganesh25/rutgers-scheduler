const bcrypt = require('bcrypt');

const plainPassword = 'testpassword'; // The password you want to use for the test user
bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
});
