export type OptionableFunc<
  Values extends Record<string, any> = {},
  Switches extends string = never,
  Args extends any[] = any[],
  R = any
> = ((...args: Args) => R) &
  {
    [K in Switches]: (...args: Args) => R;
  } &
  {
    [K in keyof Values]: (value: Values[K]) => OptionableFunc<
      Values,
      Switches,
      Args,
      R
    >;
  };

export function OptionableFunc<
  Values extends Record<string, any> = {},
  Switches extends string = never,
  Args extends any[] = any[],
  R = any
>(
  opts: {
    switches?: readonly Switches[];
    values?: readonly (keyof Values)[];
  },
  fn: (options: { [K in Switches]?: boolean } & Partial<Values>, ...args: Args) => R
): OptionableFunc<Values, Switches, Args, R> {
  const currentOptions: any = {};

  const makeCaller = (extra: any): any => {
    const mergedOptions = { ...currentOptions, ...extra };

    const caller = (...args: Args) => fn(mergedOptions, ...args);

    // switches
    for (const s of opts.switches ?? []) {
      Object.defineProperty(caller, s, {
        value: (...args: Args) => fn({ ...mergedOptions, [s]: true }, ...args),
        writable: false,
      });
    }

    // values
    for (const v of opts.values ?? []) {
      Object.defineProperty(caller, v, {
        value: (value: any) => makeCaller({ ...mergedOptions, [v]: value }),
        writable: false,
      });
    }

    return caller;
  };

  return makeCaller({});
}
