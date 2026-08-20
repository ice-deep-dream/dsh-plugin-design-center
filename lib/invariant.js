//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@cryodream/dsh-client-ui-design-center`.
* @module @cryodream/dsh-client-ui-design-center/invariant
*/
const PACKAGE_NAME = "@cryodream/dsh-client-ui-design-center";
/** Cordis companion plugin name. */
const name = "client-ui-design-center-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: a view-slot plugin with no cross-plugin mutable state. */
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
