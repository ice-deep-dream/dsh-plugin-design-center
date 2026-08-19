/** `designCenter` namespace dictionaries (view tab label + toolbar/empty strings). */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "designCenter";
/** The design-center dictionary key set (the source of truth for both locales). */
export type DesignCenterKey = 'view.designCenter' | 'toolbar.refresh' | 'toolbar.render' | 'toolbar.edit' | 'toolbar.save' | 'toolbar.cancel' | 'tab.architecture' | 'tab.modules' | 'tab.flows' | 'tab.plan' | 'empty.title' | 'empty.body' | 'status.loading' | 'status.error' | 'status.rendering' | 'status.saved' | 'status.noCwd' | 'diagram.unnamed' | 'plan.modules' | 'plan.status' | 'plan.priority' | 'plan.progress';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The design-center view tab label and toolbar strings. */
        'designCenter': DesignCenterKey;
    }
}
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: Record<DesignCenterKey, string>;
/** English dictionary. */
export declare const en: Record<DesignCenterKey, string>;
//# sourceMappingURL=locales.d.ts.map