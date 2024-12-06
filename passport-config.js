const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user); // Successful authentication, user object includes role
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    // Serialize user to store in session (store user ID)
    passport.serializeUser((user, done) => {
        done(null, user.id); // Save only the user ID in the session
    });

    // Deserialize user (retrieve the full user object from the database using the user ID)
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);  // Ensure user includes the role
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            done(null, user); // Return the complete user object including role
        } catch (error) {
            done(error);
        }
    });
}

module.exports = initialize;
