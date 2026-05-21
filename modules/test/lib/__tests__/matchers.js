describe('test/matchers', () => {
  describe('toInclude', () => {
    it('should pass if string includes substring', () => {
      expect('hello world').toInclude('world');
    });
    it('should pass if array includes value', () => {
      expect([1, 2, 3]).toInclude(2);
    });
    it('should fail if string does not include substring', () => {
      expect('hello').not.toInclude('world');
    });
  });

  describe('toBeString', () => {
    it('should pass for a string', () => {
      expect('hello').toBeString();
    });
    it('should fail for a number', () => {
      expect(42).not.toBeString();
    });
    it('should fail for an array', () => {
      expect([]).not.toBeString();
    });
  });

  describe('toStartWith', () => {
    it('should pass if string starts with prefix', () => {
      expect('hello world').toStartWith('hello');
    });
    it('should fail if string does not start with prefix', () => {
      expect('hello world').not.toStartWith('world');
    });
  });

  describe('toEndWith', () => {
    it('should pass if string ends with suffix', () => {
      expect('hello world').toEndWith('world');
    });
    it('should fail if string does not end with suffix', () => {
      expect('hello world').not.toEndWith('hello');
    });
  });

  describe('toBeEmpty', () => {
    it('should pass for an empty string', () => {
      expect('').toBeEmpty();
    });
    it('should pass for an empty array', () => {
      expect([]).toBeEmpty();
    });
    it('should pass for an empty object', () => {
      expect({}).toBeEmpty();
    });
    it('should fail for a non-empty string', () => {
      expect('hello').not.toBeEmpty();
    });
    it('should fail for a non-empty array', () => {
      expect([1, 2]).not.toBeEmpty();
    });
    it('should fail for a non-empty object', () => {
      expect({ a: 1 }).not.toBeEmpty();
    });
  });
});
