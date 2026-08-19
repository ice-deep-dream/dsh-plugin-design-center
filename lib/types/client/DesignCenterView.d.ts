import React from 'react';
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { PropsLocale, InjectFace } from '@deepseek-ai/dsh-client-ui-slots';
import type { DesignCenterController } from './data/controller.ts';
import type { NS as DesignCenterNS } from './locales.ts';
type DesignCenterInjected = {
    readonly controller: DesignCenterController;
};
export type DesignCenterViewProps = ConvViewProps & InjectFace<DesignCenterInjected> & PropsLocale<typeof DesignCenterNS>;
export declare function DesignCenterView(props: DesignCenterViewProps): React.ReactElement;
export {};
//# sourceMappingURL=DesignCenterView.d.ts.map