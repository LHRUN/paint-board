import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export const DEFAULT_TEXT_PLACEHOLDER = 'Type here...'

export const isCanvasTextObject = (
  target: { type?: string; _customType?: string } | undefined | null
) =>
  !!target &&
  (target.type === 'i-text' ||
    target._customType === ELEMENT_CUSTOM_TYPE.I_TEXT)

/**
 * A text box created by the toolbar still shows the placeholder until the user
 * types. Leaving that edit should drop the object instead of saving it.
 * Text that was already stored keeps its content, even if it is this string.
 */
export const shouldDiscardUneditedText = ({
  isNew,
  text
}: {
  isNew: boolean
  text?: string
}) => isNew && text === DEFAULT_TEXT_PLACEHOLDER
