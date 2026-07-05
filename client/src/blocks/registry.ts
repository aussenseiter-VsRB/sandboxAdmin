import type { BlockDefinition, BlockType } from './types';
import { HeroBlock, HeroEditor, TextBlock, TextEditor, ImageBlock, ImageEditor, CtaBlock, CtaEditor } from './components';

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  hero: {
    render: HeroBlock,
    edit: HeroEditor,
    defaultProps: { heading: 'New Hero', subheading: 'Subheading here', bgColor: '#1a1a2e' },
    label: 'Hero',
  },
  text: {
    render: TextBlock,
    edit: TextEditor,
    defaultProps: { content: 'Enter your text here...' },
    label: 'Text',
  },
  image: {
    render: ImageBlock,
    edit: ImageEditor,
    defaultProps: { src: '', alt: '' },
    label: 'Image',
  },
  cta: {
    render: CtaBlock,
    edit: CtaEditor,
    defaultProps: { text: 'Click Me', link: 'https://example.com' },
    label: 'CTA',
  },
};
