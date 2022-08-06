export function AutoUnsubscribe(obs$: any[] = []) {
  return function (constructor: any) {
    const orig = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = function () {
      try {
        for (const prop in this) {
          const property = this[prop];
          if (
            property !== undefined &&
            property !== null &&
            typeof property.unsubscribe === "function" &&
            !obs$.includes(property)
          )
            obs$.push(property);
        }
        for (const ob$ of obs$) {
          ob$.unsubscribe();
        }
        orig.apply();
      } catch (error) {
        console.log(error);
      }
    };
  };
}
