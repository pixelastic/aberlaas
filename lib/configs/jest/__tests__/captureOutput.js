import module from '../captureOutput';
import { chalk } from 'golgoth';

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
});
