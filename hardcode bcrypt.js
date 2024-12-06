const bcrypt = require('bcrypt');
const password = 'admin';  // The plain text password
const hashPassword = async () => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);  // Output the hashed password
    } catch (err) {
        console.error('Error hashing password:', err);
    }
};
hashPassword();
