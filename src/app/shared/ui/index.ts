// Único barrel del proyecto: los primitivos del design system.
// No agregar barrels en core/ ni en features/ — acoplan el grafo de imports
// y arrastran al chunk inicial módulos que debían ser lazy.

export { BbIcon } from './icon/icon';
export { BB_ICON_NAMES, BB_ICONS } from './icon/icon-registry';
export type { BbIconDefinition, BbIconName, BbIconShape } from './icon/icon-registry';

export { BbButton } from './button/button';
export type { BbButtonFit, BbButtonSize, BbButtonVariant } from './button/button';

export { BbIconButton } from './icon-button/icon-button';
export type { BbIconButtonVariant } from './icon-button/icon-button';

export { BbInput, BbInputAction } from './input/input';
export type { BbInputStatus } from './input/input';

export { BbCheckbox } from './checkbox/checkbox';

export { BB_FORM_MESSAGE, BbField } from './field/field';

export { BbFormMessage } from './form-message/form-message';
export type { BbFormMessageTone } from './form-message/form-message';

export { BbBadge } from './badge/badge';
export { BbChip } from './chip/chip';
export { BbNote } from './note/note';
export { BbIconTile } from './icon-tile/icon-tile';
export { BbStatusCircle } from './status-circle/status-circle';
export { BbCard } from './card/card';
export { BbStatCard } from './stat-card/stat-card';
export { BbEmptyState } from './empty-state/empty-state';
export { BbStep } from './step/step';
export { BbAvatar } from './avatar/avatar';
export { BbLogo } from './logo/logo';
