import { describe, it, expect } from 'vitest';
import { validateViaggioSchema } from '../src/utils/schemaValidator';
import sampleData from '../../viaggio-sample.json';

describe('Schema Validator Workflow', () => {
  it('valida correttamente viaggio-sample.json', () => {
    const result = validateViaggioSchema(sampleData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('intercetta strutture JSON invalide o prive di sezioni chiave', () => {
    const invalidData = { meta: { titolo: "Test" } };
    const result = validateViaggioSchema(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
