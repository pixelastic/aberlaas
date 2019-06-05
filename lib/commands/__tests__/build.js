import module from '../build';
import helper from '../../helper';

describe('build', () => {
  describe('inputFiles', () => {
    it('should use the command-line arguments', () => {
      const cliArgs = { _: ['foo', 'bar', 'baz'] };
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['foo', 'bar', 'baz']);
    });
    it('should read from ./lib by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['./lib']);
    });
  });
  describe('configFile', () => {
    it('should take the --config CLI option first', async () => {
      const cliArgs = { config: 'fooCli' };
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fooCli');
    });
    it('should take the babel.config.js in the host as fallback', async () => {
      const cliArgs = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/host/babel.config.js');
    });
    it('should take the aberlaas default if no babel.config.js in the host', async () => {
      const cliArgs = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./nope');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/aberlaas/configs/babel.js');
    });
    // it('should take the aberlaas default babel.js as fallback', () => {
    // });

    // // Which config file to use?
    // // We take the one passed as --config in priority, otherwise fallback to
    // // babel.config.js in the host, and finally babel.js in aberlaas.
    // let configFile = args.config;
    // if (!configFile) {
    //   const hostConfigFile = path.join(process.cwd(), 'babel.config.js');
    //   const aberlaasConfigFile = path.join(__dirname, '../configs/babel.js');
    //   const hostConfigFileExists = await firost.exists(hostConfigFile);
    //   configFile = hostConfigFileExists ? hostConfigFile : aberlaasConfigFile;
    // }
  });
});
