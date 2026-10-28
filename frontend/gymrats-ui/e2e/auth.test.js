const { url, login } = require('./test-utils');

fixture`Authentication`
    .page(url('/login'));

test('allows the dev user to log in', async t => {
    await login(t);
});