const { Selector } = require('testcafe');
const { url, login } = require('./test-utils');

fixture`Workout Session`
    .page(url('/login'));

test('creates a workout, trains it and verifies the session history', async t => {
    await login(t);

    // Use a unique name to avoid collisions with previous test runs.
    const workoutName = `E2E Session ${Date.now()}`;
    const exercises = ['Squat', 'Bench Press', 'Deadlift'];

    const workoutCell = name =>
        Selector('td').withExactText(name);

    const workoutRow = name =>
        workoutCell(name).parent('tr');

    // CREATE WORKOUT: 3 exercises with 3 planned sets each.
    await t.navigateTo(url('/workouts/new'));

    await t.typeText('input[formcontrolname="name"]', workoutName);

    for (const [index, exerciseName] of exercises.entries()) {
        await t.click(Selector('button').withText('Übung hinzufügen'));

        await t
            .typeText(
                `input[aria-label="Übung für Zeile ${index + 1} suchen"]`,
                exerciseName
            )
            .expect(Selector('mat-option').withExactText(exerciseName).exists)
            .ok(`${exerciseName} should be available.`, { timeout: 10000 })
            .click(Selector('mat-option').withExactText(exerciseName))
            .expect(Selector('.cdk-overlay-pane mat-option').exists)
            .notOk('The exercise autocomplete should close before entering set values.', {
                timeout: 5000,
            });

        await t
            .click(Selector('mat-label').withExactText('Geplante Sätze').nth(index))
            .typeText(
                Selector('input[formcontrolname="plannedSets"]').nth(index),
                '3'
            )
            .click(Selector('mat-label').withExactText('Min. Wdh.').nth(index))
            .typeText(
                Selector('input[formcontrolname="minReps"]').nth(index),
                '5'
            )
            .click(Selector('mat-label').withExactText('Max. Wdh.').nth(index))
            .typeText(
                Selector('input[formcontrolname="maxReps"]').nth(index),
                '12'
            );
    }

    await t.click('button[type="submit"]');

    await t
        .expect(workoutCell(workoutName).count)
        .eql(1, 'The newly created workout should appear exactly once.', {
            timeout: 10000,
        });

    // START SESSION from the workout list.
    await t.click(
        workoutRow(workoutName)
            .find('button')
            .withAttribute(
                'aria-label',
                `Trainingsplan ${workoutName} starten`
            )
    );

    await t
        .expect(Selector('h2').withExactText(workoutName).exists)
        .ok('The session form should show the workout name.', {
            timeout: 10000,
        });

    const weightInput = (exercise, set) =>
        Selector(`#weight-${exercise}-${set}`);
    const repsInput = (exercise, set) =>
        Selector(`#reps-${exercise}-${set}`);

    const finishButton = Selector('button').withText('Session beenden');

    // Nothing filled in yet: finishing must be disabled.
    await t
        .expect(finishButton.hasAttribute('disabled'))
        .ok('Finish should be disabled without any filled set.');

    // Weight is prefilled with 0; a set with weight but without reps is not filled.
    await t
        .typeText(weightInput(0, 0), '100', { replace: true })
        .expect(finishButton.hasAttribute('disabled'))
        .ok('Finish should stay disabled while a set has no reps.')
        .typeText(repsInput(0, 0), '8')
        .expect(finishButton.hasAttribute('disabled'))
        .notOk('Finish should be enabled once one set is complete.');

    // Squat: remaining sets filled.
    await t
        .typeText(weightInput(0, 1), '105', { replace: true })
        .typeText(repsInput(0, 1), '6')
        .typeText(weightInput(0, 2), '110', { replace: true })
        .typeText(repsInput(0, 2), '5');

    // Bench Press: set 2 stays empty, so only sets 1 and 3 are saved.
    await t
        .typeText(weightInput(1, 0), '60', { replace: true })
        .typeText(repsInput(1, 0), '10')
        .typeText(weightInput(1, 2), '65', { replace: true })
        .typeText(repsInput(1, 2), '8');

    // Deadlift: set 1 empty, set 2 complete, set 3 has weight only.
    await t
        .typeText(weightInput(2, 1), '120', { replace: true })
        .typeText(repsInput(2, 1), '5')
        .typeText(weightInput(2, 2), '125', { replace: true });

    // FINISH: the dialog reports 6 of 9 filled sets.
    await t
        .click(finishButton)
        .expect(
            Selector('mat-dialog-container')
                .withText('6 von 9 Sätzen sind ausgefüllt')
                .exists
        )
        .ok('The confirmation dialog should report the filled sets.');

    await t.click(
        Selector('button').withExactText('Beenden und speichern')
    );

    await t
        .expect(
            Selector('p').withText('Training wurde erfolgreich gespeichert.')
                .exists
        )
        .ok('The session should be saved.', { timeout: 10000 });

    // HISTORY: open the details of the new session.
    await t.navigateTo(url('/sessions'));

    await t.click(
        Selector('a.session-card-link')
            .withAttribute('aria-label', `Details für ${workoutName} öffnen`)
            .nth(0)
    );

    await t
        .expect(Selector('h1').withExactText(workoutName).exists)
        .ok('The session details should be shown.', { timeout: 10000 });

    const exerciseCard = title =>
        Selector('mat-card').withText(title);

    // Reads the saved set rows as [setNumber, weight, reps].
    const setRows = async title => {
        const rows = exerciseCard(title).find('tbody tr');
        const count = await rows.count;
        const result = [];

        for (let i = 0; i < count; i++) {
            const cells = rows.nth(i).find('td');
            result.push([
                (await cells.nth(0).innerText).trim(),
                (await cells.nth(1).innerText).trim(),
                (await cells.nth(2).innerText).trim(),
            ]);
        }

        return result;
    };

    await t
        .expect(exerciseCard('1. Squat').exists)
        .ok('Squat should be part of the session.', { timeout: 10000 });

    await t.expect(await setRows('1. Squat')).eql([
        ['1', '100', '8'],
        ['2', '105', '6'],
        ['3', '110', '5'],
    ], 'All three Squat sets should be saved.');

    // The empty second set is omitted and the remaining sets are renumbered.
    await t.expect(await setRows('2. Bench Press')).eql([
        ['1', '60', '10'],
        ['2', '65', '8'],
    ], 'The empty Bench Press set should be omitted.');

    // Empty set 1 and the weight-only set 3 are omitted.
    await t.expect(await setRows('3. Deadlift')).eql([
        ['1', '120', '5'],
    ], 'Only the complete Deadlift set should be saved.');

    // CLEANUP: remove the workout again.
    await t.navigateTo(url('/workouts'));
    await t.click(
        workoutRow(workoutName)
            .find('button')
            .withAttribute(
                'aria-label',
                `Trainingsplan ${workoutName} löschen`
            )
    );
    await t.click(Selector('button').withExactText('Löschen'));
    await t
        .expect(workoutCell(workoutName).exists)
        .notOk('The workout should be deleted.', { timeout: 10000 });
});
