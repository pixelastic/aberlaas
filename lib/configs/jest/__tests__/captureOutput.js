const module = jestImport('../captureOutput');
const chalk = jestImport('golgoth/lib/chalk');

describe('captureOutput', () => {
  it('should capture stdout output', async () => {
    const actual = await module.run(() => {
      process.stdout.write('foo');
    });

    expect(actual).toHaveProperty('stdout', ['foo']);
  });
  it('should capture stderr output', async () => {
    const actual = await module.run(() => {
      process.stderr.write('foo');
    });

    expect(actual).toHaveProperty('stderr', ['foo']);
  });
  it('should remove ANSI characters', async () => {
    const actual = await module.run(() => {
      process.stdout.write(chalk.red('foo'));
    });

    expect(actual).toHaveProperty('stdout', ['foo']);
  });
  it('should trim trailing newlines', async () => {
    const actual = await module.run(() => {
      process.stdout.write('foo\n');
    });

    expect(actual).toHaveProperty('stdout', ['foo']);
  });
  it('should discard previous capture after a call', async () => {
    await module.run(() => {
      process.stdout.write('foo\n');
    });
    const actual = await module.run(() => {
      process.stdout.write('bar\n');
    });

    expect(actual).toHaveProperty('stdout', ['bar']);
  });
  it('should discard previous capture after a failed', async () => {
    try {
      await module.run(() => {
        process.stdout.write('foo\n');
        throw new Error();
      });
    } catch (err) {
      // Swallowing the error
    }

    const actual = await module.run(() => {
      process.stdout.write('bar\n');
    });

    expect(actual).toHaveProperty('stdout', ['bar']);
  });
});