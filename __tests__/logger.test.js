const { logger } = require('../utils/logger');

describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  test('info calls console.log', () => {
    logger.info('hello', { a: 1 });
    expect(console.log).toHaveBeenCalled();
  });

  test('warn calls console.warn', () => {
    logger.warn('be careful');
    expect(console.warn).toHaveBeenCalled();
  });

  test('error calls console.error', () => {
    logger.error('bad', new Error('boom'));
    expect(console.error).toHaveBeenCalled();
  });
});
