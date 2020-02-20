import { SingleStatLinkedCtrl, ShowData } from '../module';
import { dateTime, ReducerID } from '@grafana/data';
import { LinkSrv } from 'app/features/panel/panellinks/link_srv';
import { LegacyResponseData } from '@grafana/data';
import { DashboardModel } from 'app/features/dashboard/state';

interface TestContext {
  ctrl: SingleStatLinkedCtrl;
  input: LegacyResponseData[];
  data: Partial<ShowData>;
  setup: (setupFunc: any) => void;
}

describe('SingleStatLinkedCtrl', () => {
  const ctx: TestContext = {} as TestContext;
  const epoch = 1505826363746;
  Date.now = () => epoch;

  const $scope = {
    $on: () => {},
  };

  const $injector = {
    get: () => {},
  };

  const $sanitize = {};

  SingleStatLinkedCtrl.prototype.panel = {
    events: {
      on: () => {},
      emit: () => {},
    },
  };
  SingleStatLinkedCtrl.prototype.dashboard = ({
    getTimezone: jest.fn(() => 'utc'),
  } as any) as DashboardModel;
  SingleStatLinkedCtrl.prototype.events = {
    on: () => {},
  };

  function singleStatLinkedScenario(desc: string, func: any) {
    describe(desc, () => {
      ctx.setup = (setupFunc: any) => {
        beforeEach(() => {
          // @ts-ignore
          ctx.ctrl = new SingleStatLinkedCtrl($scope, $injector, {} as LinkSrv, $sanitize);
          setupFunc();
          ctx.ctrl.onSnapshotLoad(ctx.input);
          ctx.data = ctx.ctrl.data;
        });
      };

      func(ctx);
    });
  }

  singleStatLinkedScenario('with defaults', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 1],
            [20, 2],
          ],
        },
      ];
    });

    it('Should use series avg as default main value', () => {
      expect(ctx.data.value).toBe(15);
    });

    it('should set formatted falue', () => {
      expect(ctx.data.display!.text).toBe('15');
    });
  });

  singleStatLinkedScenario('showing serie name instead of value', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 1],
            [20, 2],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'name';
    });

    it('Should use series avg as default main value', () => {
      expect(ctx.data.value).toBe('test.cpu1');
    });

    it('should set formatted value', () => {
      expect(ctx.data.display!.text).toBe('test.cpu1');
    });
  });

  singleStatLinkedScenario('showing last iso time instead of value', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 1505634997920],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeAsIso';
      ctx.ctrl.dashboard.getTimezone = () => 'browser';
    });

    it('Should use time instead of value', () => {
      expect(ctx.data.value).toBe(1505634997920);
    });

    it('should set formatted value', () => {
      expect(dateTime(ctx.data.display!.text).valueOf()).toBe(1505634997000);
    });
  });

  singleStatLinkedScenario('showing last iso time instead of value (in UTC)', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 5000],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeAsIso';
      ctx.ctrl.dashboard.getTimezone = () => 'utc';
    });

    it('should set value', () => {
      expect(ctx.data.display!.text).toBe('1970-01-01 00:00:05');
    });
  });

  singleStatLinkedScenario('showing last us time instead of value', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 1505634997920],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeAsUS';
      ctx.ctrl.dashboard.getTimezone = () => 'browser';
    });

    it('Should use time instead of value', () => {
      expect(ctx.data.value).toBe(1505634997920);
    });

    it('should set formatted value', () => {
      expect(ctx.data.display!.text).toBe(dateTime(1505634997920).format('MM/DD/YYYY h:mm:ss a'));
    });
  });

  singleStatLinkedScenario('showing last us time instead of value (in UTC)', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 5000],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeAsUS';
      ctx.ctrl.dashboard.getTimezone = () => 'utc';
    });

    it('should set formatted value', () => {
      expect(ctx.data.display!.text).toBe('01/01/1970 12:00:05 am');
    });
  });

  singleStatLinkedScenario('showing last time from now instead of value', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 1505634997920],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeFromNow';
    });

    it('Should use time instead of value', () => {
      expect(ctx.data.value).toBe(1505634997920);
    });

    it('should set formatted value', () => {
      expect(ctx.data.display!.text).toBe('2 days ago');
    });
  });

  singleStatLinkedScenario('showing last time from now instead of value (in UTC)', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [
        {
          target: 'test.cpu1',
          datapoints: [
            [10, 12],
            [20, 1505634997920],
          ],
        },
      ];
      ctx.ctrl.panel.valueName = 'last_time';
      ctx.ctrl.panel.format = 'dateTimeFromNow';
    });

    it('should set formatted value', () => {
      expect(ctx.data.display!.text).toBe('2 days ago');
    });
  });

  singleStatLinkedScenario(
    'MainValue should use same number for decimals as displayed when checking thresholds',
    (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = [
          {
            target: 'test.cpu1',
            datapoints: [
              [99.999, 1],
              [99.99999, 2],
            ],
          },
        ];
        ctx.ctrl.panel.valueName = 'avg';
        ctx.ctrl.panel.format = 'none';
      });

      it('Should be rounded', () => {
        expect(ctx.data.value).toBe(99.999495);
      });

      it('should set formatted value', () => {
        expect(ctx.data.display!.text).toBe('100');
      });
    }
  );

  singleStatLinkedScenario('When value to text mapping is specified', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [{ target: 'test.cpu1', datapoints: [[9.9, 1]] }];
      ctx.ctrl.panel.valueMaps = [{ value: '9.9', text: 'OK' }];
    });

    it('value should remain', () => {
      expect(ctx.data.value).toBe(9.9);
    });

    it('Should replace value with text', () => {
      expect(ctx.data.display!.text).toBe('OK');
    });
  });

  singleStatLinkedScenario('When mapping null values and no data', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = []; // No data
      ctx.ctrl.panel.valueMaps = [{ value: 'null', text: 'XYZ' }];
    });

    it('value should be null', () => {
      expect(ctx.data.value).toBe(null);
    });

    it('Should replace value with text', () => {
      expect(ctx.data.display!.text).toBe('XYZ');
    });
  });

  singleStatLinkedScenario('When range to text mapping is specified for first range', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [{ target: 'test.cpu1', datapoints: [[41, 50]] }];
      ctx.ctrl.panel.mappingType = 2;
      ctx.ctrl.panel.rangeMaps = [
        { from: '10', to: '50', text: 'OK' },
        { from: '51', to: '100', text: 'NOT OK' },
      ];
    });

    it('Should replace value with text OK', () => {
      expect(ctx.data.display!.text).toBe('OK');
    });
  });

  singleStatLinkedScenario('When range to text mapping is specified for other ranges', (ctx: TestContext) => {
    ctx.setup(() => {
      ctx.input = [{ target: 'test.cpu1', datapoints: [[65, 75]] }];
      ctx.ctrl.panel.mappingType = 2;
      ctx.ctrl.panel.rangeMaps = [
        { from: '10', to: '50', text: 'OK' },
        { from: '51', to: '100', text: 'NOT OK' },
      ];
    });

    it('Should replace value with text NOT OK', () => {
      expect(ctx.data.display!.text).toBe('NOT OK');
    });
  });

  describe('When table data', () => {
    const tableData = [
      {
        columns: [{ text: 'Time', type: 'time' }, { text: 'test1' }, { text: 'mean' }, { text: 'test2' }],
        rows: [[1492759673649, 'ignore1', 15, 'ignore2']],
        type: 'table',
      },
    ];

    singleStatLinkedScenario('with default values', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.ctrl.panel = {
          emit: () => {},
        };
        ctx.ctrl.panel.tableColumn = 'mean';
        ctx.ctrl.panel.format = 'none';
      });

      it('Should use first rows value as default main value', () => {
        expect(ctx.data.value).toBe(15);
      });

      it('should set formatted value', () => {
        expect(ctx.data.display!.text).toBe('15');
      });
    });

    singleStatLinkedScenario('When table data has multiple columns', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.ctrl.panel.tableColumn = '';
      });

      it('Should set column to first column that is not time', () => {
        expect(ctx.ctrl.panel.tableColumn).toBe('test1');
      });
    });

    singleStatLinkedScenario(
      'MainValue should use same number for decimals as displayed when checking thresholds',
      (ctx: TestContext) => {
        ctx.setup(() => {
          ctx.input = tableData;
          ctx.input[0].rows[0] = [1492759673649, 'ignore1', 99.99999, 'ignore2'];
          ctx.ctrl.panel.mappingType = 0;
          ctx.ctrl.panel.tableColumn = 'mean';
        });

        it('Should be rounded', () => {
          expect(ctx.data.value).toBe(99.99999);
        });

        it('should set formatted falue', () => {
          expect(ctx.data.display!.text).toBe('100');
        });
      }
    );

    singleStatLinkedScenario('When value to text mapping is specified', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.input[0].rows[0] = [1492759673649, 'ignore1', 10, 'ignore2'];
        ctx.ctrl.panel.mappingType = 2;
        ctx.ctrl.panel.tableColumn = 'mean';
        ctx.ctrl.panel.valueMaps = [{ value: '10', text: 'OK' }];
      });

      it('value should remain', () => {
        expect(ctx.data.value).toBe(10);
      });

      it('Should replace value with text', () => {
        expect(ctx.data.display!.text).toBe('OK');
      });
    });

    singleStatLinkedScenario('When range to text mapping is specified for first range', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.input[0].rows[0] = [1492759673649, 'ignore1', 41, 'ignore2'];
        ctx.ctrl.panel.tableColumn = 'mean';
        ctx.ctrl.panel.mappingType = 2;
        ctx.ctrl.panel.rangeMaps = [
          { from: '10', to: '50', text: 'OK' },
          { from: '51', to: '100', text: 'NOT OK' },
        ];
      });

      it('Should replace value with text OK', () => {
        expect(ctx.data.display!.text).toBe('OK');
      });
    });

    singleStatLinkedScenario('When range to text mapping is specified for other ranges', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.input[0].rows[0] = [1492759673649, 'ignore1', 65, 'ignore2'];
        ctx.ctrl.panel.tableColumn = 'mean';
        ctx.ctrl.panel.mappingType = 2;
        ctx.ctrl.panel.rangeMaps = [
          { from: '10', to: '50', text: 'OK' },
          { from: '51', to: '100', text: 'NOT OK' },
        ];
      });

      it('Should replace value with text NOT OK', () => {
        expect(ctx.data.display!.text).toBe('NOT OK');
      });
    });

    singleStatLinkedScenario('When value is string', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.input[0].rows[0] = [1492759673649, 'ignore1', 65, 'ignore2'];
        ctx.ctrl.panel.tableColumn = 'test1';
        ctx.ctrl.panel.valueName = ReducerID.first;
      });

      it('Should replace value with text NOT OK', () => {
        expect(ctx.data.display!.text).toBe('ignore1');
      });
    });

    singleStatLinkedScenario('When value is zero', (ctx: TestContext) => {
      ctx.setup(() => {
        ctx.input = tableData;
        ctx.input[0].rows[0] = [1492759673649, 'ignore1', 0, 'ignore2'];
        ctx.ctrl.panel.tableColumn = 'mean';
      });

      it('Should return zero', () => {
        expect(ctx.data.value).toBe(0);
      });
    });
  });
});
