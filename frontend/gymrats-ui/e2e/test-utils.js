const { Selector } = require('testcafe');

const BASE_URL = 'http://localhost:4200';

// Credentials of the test user created by DataInitializer.java.
const TEST_USER = {
    email: 'test@user.com',
    password: 'TestPassword123',
};

const url = (path = '') => `${BASE_URL}${path}`;

/**
 * Clears any previous authentication state and logs in as the test user.
 */
async function login(t) {
    await t.eval(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    await t.navigateTo(url('/login'));

    await t
        .typeText('#email', TEST_USER.email)
        .typeText('#password', TEST_USER.password)
        .click('button[type="submit"]')
        .expect(
            Selector('h1')
                .withText('Dein Training. Dein Fortschritt.')
                .exists
        )
        .ok('Login should succeed.', { timeout: 10000 });
}

module.exports = { BASE_URL, TEST_USER, url, login };
