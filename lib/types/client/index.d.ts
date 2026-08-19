/**
 * Browser entry: registers the "设计中心 / Design Center" conversation-view tab
 * at order 20 (after chat=0 and trajectory=10) and wires the data controller.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Dependency injection slots consumed on the browser side. */
export declare const inject: readonly ["slots", "sessions", "locale", "connection"];
/**
 * Register the locale dictionaries, instantiate one controller per context,
 * and inject the design-center tab into the conversation.view list slot.
 */
export declare function apply(ctx: Context): void;
declare const _default: {
    name: string;
    apply: typeof apply;
    inject: readonly ["slots", "sessions", "locale", "connection"];
};
export default _default;
//# sourceMappingURL=index.d.ts.map