import { DesignCenterController } from "./data/controller.js";
import { DesignCenterView } from "./DesignCenterView.js";
import { NS, en, zh } from "./locales.js";
/** Dependency injection slots consumed on the browser side. */
export const inject = ['slots', 'sessions', 'locale', 'connection'];
/**
 * Register the locale dictionaries, instantiate one controller per context,
 * and inject the design-center tab into the conversation.view list slot.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-design-center: dictionaries');
    const t = ctx.locale.bind(NS);
    const connection = ctx.get('connection');
    const controller = new DesignCenterController(connection.rpc);
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'design-center',
        order: 20,
        locale: NS,
        label: () => t('view.designCenter'),
        inject: (_sessionId) => ({ controller }),
    }, DesignCenterView));
}
export default { name: 'ui-design-center', apply, inject };
//# sourceMappingURL=index.js.map