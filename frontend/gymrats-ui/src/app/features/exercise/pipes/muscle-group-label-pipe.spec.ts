import { MuscleGroupLabelPipe } from './muscle-group-label-pipe';

describe('MuscleGroupLabelPipe', () => {
  const pipe = new MuscleGroupLabelPipe();

  it('übersetzt einen bekannten Wert in das deutsche Label', () => {
    expect(pipe.transform('CHEST')).toBe('Brust');
    expect(pipe.transform('OTHER')).toBe('Sonstiges');
  });

  it('gibt einen unbekannten Wert unverändert zurück', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
  });

  it.each([null, undefined])('gibt für %s einen leeren String zurück', (value) => {
    expect(pipe.transform(value)).toBe('');
  });
});
