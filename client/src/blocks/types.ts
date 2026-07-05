export type BlockType = 'hero' | 'text' | 'image' | 'cta';

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

export interface BlockDefinition {
  render: React.ComponentType<{ props: Record<string, any> }>;
  edit: React.ComponentType<{
    props: Record<string, any>;
    onChange: (props: Record<string, any>) => void;
  }>;
  defaultProps: Record<string, any>;
  label: string;
}
