import { getQueryStatusLabel } from '../utils/getQueryStatusLabel';
import { deleteNestedDataByPath } from '../utils/deleteNestedDataByPath';
import { updateNestedDataByPath } from '../utils/updateNestedDataByPath';

describe('React Query Utils', () => {
  describe('getQueryStatusLabel', () => {
    it('should return "fetching" when fetch status is fetching', () => {
      const query = {
        state: {
          status: 'success',
          fetchStatus: 'fetching',
        },
        isStale: () => false,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('fetching');
    });

    it('should return "paused" when fetch status is paused', () => {
      const query = {
        state: {
          status: 'success',
          fetchStatus: 'paused',
        },
        isStale: () => false,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('paused');
    });

    it('should return "error" when status is error', () => {
      const query = {
        state: {
          status: 'error',
          fetchStatus: 'idle',
        },
        isStale: () => true,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('error');
    });

    it('should return "pending" when status is pending', () => {
      const query = {
        state: {
          status: 'pending',
          fetchStatus: 'idle',
        },
        isStale: () => false,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('pending');
    });

    it('should return "fresh" when not stale', () => {
      const query = {
        state: {
          status: 'success',
          fetchStatus: 'idle',
        },
        isStale: () => false,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('fresh');
    });

    it('should return "stale" when stale', () => {
      const query = {
        state: {
          status: 'success',
          fetchStatus: 'idle',
        },
        isStale: () => true,
        getObserversCount: () => 1,
      };
      expect(getQueryStatusLabel(query as any)).toBe('stale');
    });

    it('should return "inactive" when observers count is 0', () => {
      const query = {
        state: {
          status: 'success',
          fetchStatus: 'idle',
        },
        isStale: () => false,
        getObserversCount: () => 0,
      };
      expect(getQueryStatusLabel(query as any)).toBe('inactive');
    });
  });


  describe('deleteNestedDataByPath', () => {
    it('should delete nested property by path', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
            age: 30,
            address: {
              city: 'New York',
              country: 'USA',
            },
          },
        },
      };

      const result = deleteNestedDataByPath(data, ['user', 'profile', 'address', 'city']);
      
      expect(result.user.profile.address.city).toBeUndefined();
      expect(result.user.profile.address.country).toBe('USA');
      expect(result.user.profile.name).toBe('John');
    });

    it('should delete array element by index', () => {
      const data = {
        items: ['apple', 'banana', 'orange'],
      };

      const result = deleteNestedDataByPath(data, ['items', '1']);
      
      expect(result.items).toEqual(['apple', 'orange']);
    });

    it('should handle non-existent paths gracefully', () => {
      const data = {
        user: {
          name: 'John',
        },
      };

      const result = deleteNestedDataByPath(data, ['user', 'profile', 'age']);
      
      expect(result).toEqual(data);
    });

    it('should return original data for empty path', () => {
      const data = { test: 'value' };
      const result = deleteNestedDataByPath(data, []);
      
      expect(result).toEqual(data);
    });

    it('should handle null and undefined values', () => {
      const data = {
        value: null,
        other: undefined,
      };

      const result = deleteNestedDataByPath(data, ['value']);
      
      expect(result.value).toBeUndefined();
      expect(result.other).toBeUndefined();
    });
  });

  describe('updateNestedDataByPath', () => {
    it('should update nested property by path', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      };

      const result = updateNestedDataByPath(data, ['user', 'profile', 'age'], 31);
      
      expect(result.user.profile.age).toBe(31);
      expect(result.user.profile.name).toBe('John');
    });

    it('should create nested structure if it does not exist', () => {
      const data = {
        user: {},
      };

      const result = updateNestedDataByPath(data, ['user', 'profile', 'name'], 'Jane');
      
      expect((result.user as any).profile?.name).toBe('Jane');
    });

    it('should update array element by index', () => {
      const data = {
        items: ['apple', 'banana', 'orange'],
      };

      const result = updateNestedDataByPath(data, ['items', '1'], 'grape');
      
      expect(result.items).toEqual(['apple', 'grape', 'orange']);
    });

    it('should add new array element', () => {
      const data = {
        items: ['apple', 'banana'],
      };

      const result = updateNestedDataByPath(data, ['items', '2'], 'orange');
      
      expect(result.items).toEqual(['apple', 'banana', 'orange']);
    });

    it('should handle empty path', () => {
      const data = { test: 'value' };
      const result = updateNestedDataByPath(data, [], { new: 'data' });
      
      expect(result).toEqual({ new: 'data' });
    });

    it('should handle complex nested updates', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'old',
            },
          },
        },
      };

      const result = updateNestedDataByPath(
        data,
        ['level1', 'level2', 'level3', 'value'],
        'new'
      );
      
      expect(result.level1.level2.level3.value).toBe('new');
    });

    it('should preserve other properties when updating', () => {
      const data = {
        user: {
          name: 'John',
          age: 30,
          email: 'john@example.com',
        },
      };

      const result = updateNestedDataByPath(data, ['user', 'age'], 31);
      
      expect(result.user).toEqual({
        name: 'John',
        age: 31,
        email: 'john@example.com',
      });
    });

    it('should handle updating to null or undefined', () => {
      const data = {
        user: {
          name: 'John',
          age: 30,
        },
      };

      let result = updateNestedDataByPath(data, ['user', 'age'], null);
      expect(result.user.age).toBeNull();

      result = updateNestedDataByPath(data, ['user', 'name'], undefined);
      expect(result.user.name).toBeUndefined();
    });
  });
});