const { Selector } = require('testcafe');

fixture('Authentication')
    .page('http://localhost:4200/login');

test('allows the dev user to log in', async t => {
    await t
        .typeText('#email', 'patrick@example.com')
        .typeText('#password', 'TestPassword123!')
        .click('button[type="submit"]')
        .expect(
            Selector('h1')
                .withText('Dein Training. Dein Fortschritt.')
                .exists
        )
        .ok(
            'Nach erfolgreichem Login sollte die Home-Seite erscheinen.',
            { timeout: 10000 }
        );
});