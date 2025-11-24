import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberSchema,
  projectSearchSchema,
} from '../../../src/services/project/project.types';

describe('Project Types and Schemas', () => {
  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        name: 'Test Project',
        key: 'TEST123',
        description: 'A test project',
        isPublic: false,
        accessibilityLevel: 'AA',
        highContrastMode: false,
        screenReaderOptimized: true,
      };

      const result = createProjectSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject project name too short', () => {
      const invalidData = {
        name: 'AB',
        key: 'TEST',
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should reject project name too long', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        key: 'TEST',
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid project key format', () => {
      const invalidData = {
        name: 'Test Project',
        key: 'test', // lowercase not allowed
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should reject project key starting with number', () => {
      const invalidData = {
        name: 'Test Project',
        key: '123TEST',
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should accept project key with uppercase and numbers', () => {
      const validData = {
        name: 'Test Project',
        key: 'TEST123',
      };

      const result = createProjectSchema.parse(validData);
      expect(result.key).toBe('TEST123');
    });

    it('should apply default values', () => {
      const minimalData = {
        name: 'Test Project',
        key: 'TEST',
      };

      const result = createProjectSchema.parse(minimalData);
      expect(result.isPublic).toBe(false);
      expect(result.accessibilityLevel).toBe('AA');
      expect(result.highContrastMode).toBe(false);
      expect(result.screenReaderOptimized).toBe(false);
    });

    it('should reject invalid accessibility level', () => {
      const invalidData = {
        name: 'Test Project',
        key: 'TEST',
        accessibilityLevel: 'INVALID',
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should accept all valid accessibility levels', () => {
      ['A', 'AA', 'AAA'].forEach((level) => {
        const data = {
          name: 'Test Project',
          key: 'TEST',
          accessibilityLevel: level,
        };

        const result = createProjectSchema.parse(data);
        expect(result.accessibilityLevel).toBe(level);
      });
    });
  });

  describe('updateProjectSchema', () => {
    it('should validate partial updates', () => {
      const updateData = {
        name: 'Updated Project',
        isPublic: true,
      };

      const result = updateProjectSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should allow empty update', () => {
      const result = updateProjectSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid field values', () => {
      const invalidData = {
        name: 'AB', // too short
      };

      expect(() => updateProjectSchema.parse(invalidData)).toThrow();
    });

    it('should allow updating accessibility settings', () => {
      const updateData = {
        accessibilityLevel: 'AAA',
        highContrastMode: true,
        screenReaderOptimized: true,
      };

      const result = updateProjectSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should allow archiving project', () => {
      const updateData = {
        isArchived: true,
      };

      const result = updateProjectSchema.parse(updateData);
      expect(result.isArchived).toBe(true);
    });
  });

  describe('addMemberSchema', () => {
    it('should validate valid member data', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: 'member',
      };

      const result = addMemberSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        userId: 'not-a-uuid',
        role: 'member',
      };

      expect(() => addMemberSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: 'owner', // not allowed, only admin/member/viewer
      };

      expect(() => addMemberSchema.parse(invalidData)).toThrow();
    });

    it('should accept all valid roles', () => {
      ['admin', 'member', 'viewer'].forEach((role) => {
        const data = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          role,
        };

        const result = addMemberSchema.parse(data);
        expect(result.role).toBe(role);
      });
    });

    it('should apply default role', () => {
      const data = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = addMemberSchema.parse(data);
      expect(result.role).toBe('member');
    });
  });

  describe('updateMemberSchema', () => {
    it('should validate role update', () => {
      const validData = {
        role: 'admin',
      };

      const result = updateMemberSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should require role field', () => {
      expect(() => updateMemberSchema.parse({})).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        role: 'superadmin',
      };

      expect(() => updateMemberSchema.parse(invalidData)).toThrow();
    });
  });

  describe('projectSearchSchema', () => {
    it('should validate search with all parameters', () => {
      const searchData = {
        query: 'test',
        isPublic: true,
        isArchived: false,
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
        page: 2,
        limit: 50,
      };

      const result = projectSearchSchema.parse(searchData);
      expect(result).toEqual(searchData);
    });

    it('should apply default pagination', () => {
      const result = projectSearchSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should reject invalid page number', () => {
      const invalidData = {
        page: 0,
      };

      expect(() => projectSearchSchema.parse(invalidData)).toThrow();
    });

    it('should reject limit too high', () => {
      const invalidData = {
        limit: 101,
      };

      expect(() => projectSearchSchema.parse(invalidData)).toThrow();
    });

    it('should accept minimum valid limit', () => {
      const data = {
        limit: 1,
      };

      const result = projectSearchSchema.parse(data);
      expect(result.limit).toBe(1);
    });

    it('should accept maximum valid limit', () => {
      const data = {
        limit: 100,
      };

      const result = projectSearchSchema.parse(data);
      expect(result.limit).toBe(100);
    });

    it('should allow optional filters', () => {
      const data1 = projectSearchSchema.parse({ query: 'test' });
      expect(data1.query).toBe('test');

      const data2 = projectSearchSchema.parse({ isPublic: true });
      expect(data2.isPublic).toBe(true);

      const data3 = projectSearchSchema.parse({ isArchived: false });
      expect(data3.isArchived).toBe(false);
    });

    it('should reject invalid UUID for ownerId', () => {
      const invalidData = {
        ownerId: 'not-a-uuid',
      };

      expect(() => projectSearchSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Type Inference', () => {
    it('should infer correct types from schemas', () => {
      // This test ensures TypeScript type inference works correctly
      const projectData = {
        name: 'Test',
        key: 'TEST',
        description: 'desc',
        isPublic: false,
        accessibilityLevel: 'AA' as const,
        highContrastMode: false,
        screenReaderOptimized: true,
      };

      const parsed = createProjectSchema.parse(projectData);
      
      // TypeScript should infer these types correctly
      const name: string = parsed.name;
      const key: string = parsed.key;
      const isPublic: boolean = parsed.isPublic;
      const level: 'A' | 'AA' | 'AAA' = parsed.accessibilityLevel;

      expect(name).toBe('Test');
      expect(key).toBe('TEST');
      expect(isPublic).toBe(false);
      expect(level).toBe('AA');
    });
  });
});
