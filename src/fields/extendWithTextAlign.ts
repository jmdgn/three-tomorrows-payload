import { AlignFeature } from '@payloadcms/richtext-lexical';
import { LexicalRichTextFieldProps } from '@payloadcms/richtext-lexical/dist/types';

/**
 * Adds text alignment options to rich text fields
 * 
 * @param options - Additional editor options
 * @returns Editor configuration with text alignment
 */
export const extendWithTextAlign = (options: Partial<LexicalRichTextFieldProps> = {}): Partial<LexicalRichTextFieldProps> => {
  return {
    features: ({ defaultFeatures }) => {
      // Get default features or use empty array if undefined
      const features = defaultFeatures || [];
      
      // Add text alignment feature
      return [
        ...features,
        AlignFeature({
          alignments: ['left', 'center', 'right', 'justify'],
        }),
      ];
    },
    ...options,
  };
};