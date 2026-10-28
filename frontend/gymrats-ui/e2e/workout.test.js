const { Selector } = require('testcafe');
const { url, login } = require('./test-utils');

fixture`Workout CRUD`
    .page(url('/login'));

test('creates, edits and deletes a workout', async t => {
    await login(t);

    // Use a unique name to avoid collisions with previous test runs.
    const workoutName = `E2E Workout ${Date.now()}`;
    const updatedWorkoutName = `${workoutName} Updated`;

    const workoutCell = name =>
        Selector('td').withExactText(name);

    const workoutRow = name =>
        workoutCell(name).parent('tr');

    // CREATE: Open the form.
    await t.navigateTo(url('/workouts/new'));

    await t
        .typeText('input[formcontrolname="name"]', workoutName)
        .typeText(
            'textarea[formcontrolname="description"]',
            'Automatisierter E2E-Test'
        )
        .click(
            Selector('button').withText('Übung hinzufügen')
        );

    // Select an exercise.
    await t
        .typeText(
            'input[aria-label="Übung für Zeile 1 suchen"]',
            'Squat'
        )
        .expect(
            Selector('mat-option').withExactText('Squat').exists
        )
        .ok('Squat should be available.', { timeout: 10000 })
        .click(
            Selector('mat-option').withExactText('Squat')
        )
        .click(Selector('mat-label').withExactText('Geplante Sätze').nth(0))
        .typeText('input[formcontrolname="plannedSets"]', '3')
        .click(Selector('mat-label').withExactText('Min. Wdh.').nth(0))
        .typeText('input[formcontrolname="minReps"]', '8')
        .click(Selector('mat-label').withExactText('Max. Wdh.').nth(0))
        .typeText('input[formcontrolname="maxReps"]', '12');

    // Configure the exercise.
    await t.click('button[type="submit"]');

    // Verify that exactly the newly created workout exists.
    await t
        .expect(workoutCell(workoutName).count)
        .eql(1, 'The newly created workout should appear exactly once.', {
            timeout: 10000,
        });

    // UPDATE: Open the edit form from the exact workout row.
    await t.click(
        workoutRow(workoutName)
            .find('button')
            .withAttribute(
                'aria-label',
                `Trainingsplan ${workoutName} bearbeiten`
            )
    );

    await t
        .expect(Selector('input[formcontrolname="name"]').value)
        .eql(workoutName, 'The edit form should contain the original name.');

    await t
        .typeText(
            'input[formcontrolname="name"]',
            updatedWorkoutName,
            { replace: true }
        )
        .typeText(
            'textarea[formcontrolname="description"]',
            'Bearbeitet durch den E2E-Test',
            { replace: true }
        )
        .click(Selector('mat-label').withExactText('Geplante Sätze').nth(0))
        .typeText(
            'input[formcontrolname="plannedSets"]',
            '4',
            { replace: true }
        )
        .click('button[type="submit"]');

    // Verify the updated name, using exact matching.
    await t
        .expect(workoutCell(updatedWorkoutName).count)
        .eql(1, 'The updated workout should appear exactly once.', {
            timeout: 10000,
        });

    await t
        .expect(workoutCell(workoutName).exists)
        .notOk('The original workout name should no longer exist.');

    // DELETE: Target the updated workout's exact row.
    await t.click(
        workoutRow(updatedWorkoutName)
            .find('button')
            .withAttribute(
                'aria-label',
                `Trainingsplan ${updatedWorkoutName} löschen`
            )
    );

    // Verify the confirmation dialog.
    await t
        .expect(
            Selector('h2')
                .withExactText('Trainingsplan löschen?')
                .exists
        )
        .ok('The delete confirmation dialog should appear.');

    // Confirm deletion.
    await t.click(
        Selector('button').withExactText('Löschen')
    );

    // Verify that the updated workout no longer exists.
    await t
        .expect(workoutCell(updatedWorkoutName).exists)
        .notOk('The workout should no longer appear after deletion.', {
            timeout: 10000,
        });
});