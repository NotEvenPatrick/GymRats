const { Selector } = require('testcafe');

fixture`Authentication`
    .page`http://localhost:4200/login`;

test('allows the dev user to log in', async t => {
    // Clear any previous authentication state.
    await t.eval(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    // Open the login page with a clean authentication state.
    await t.navigateTo('http://localhost:4200/login');

    await t
        .typeText('#email', 'patrick@example.com')
        .typeText('#password', 'TestPassword123!')
        .click('button[type="submit"]')
        .expect(
            Selector('h1')
                .withText('Dein Training. Dein Fortschritt.')
                .exists
        )
        .ok('The user should be redirected to the home page.', {
            timeout: 10000,
        });
});