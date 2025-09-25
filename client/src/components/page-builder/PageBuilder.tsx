import { useState, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save,
  Type,
  Image as ImageIcon,
  User,
  Target,
  MapPin,
  Layout,
  ArrowLeft
} from "lucide-react";
import EditableHeroBlock from "./blocks/EditableHeroBlock.tsx";
import EditableTextBlock from "./blocks/EditableTextBlock.tsx";
import EditableImageBlock from "./blocks/EditableImageBlock.tsx";
import EditableProductBlock from "./blocks/EditableProductBlock.tsx";
import EditableTestimonialBlock from "./blocks/EditableTestimonialBlock.tsx";
import EditableContactBlock from "./blocks/EditableContactBlock.tsx";
import BlockToolbar from "./BlockToolbar";
import { type Page } from "@shared/schema";

// DnD types
const ITEM_TYPE = 'block';

interface ContentBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'product' | 'testimonial' | 'contact';
  title?: string;
  subtitle?: string;
  description?: string;
  buttons?: Array<{
    text: string;
    link: string;
    variant: 'default' | 'secondary' | 'outline';
  }>;
  [key: string]: any;
}

interface PageBuilderProps {
  page?: Page;
  onSave: (pageData: {
    title: string;
    content: string;
    status: 'draft' | 'published';
    seoTitle?: string;
    seoDescription?: string;
  }) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export default function PageBuilder({ page, onSave, onClose, isLoading }: PageBuilderProps) {
  const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    if (page?.content) {
      try {
        const content = JSON.parse(page.content);
        return content.blocks.map((block: any, index: number) => ({
          ...block,
          id: `block_${index}_${Date.now()}`
        }));
      } catch (error) {
        console.error('Error parsing page content:', error);
        return [];
      }
    }
    return [];
  });
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState({
    title: page?.title || '',
    seoTitle: page?.seoTitle || '',
    seoDescription: page?.seoDescription || '',
    status: page?.status || 'draft' as 'draft' | 'published'
  });

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      const draggedBlock = newBlocks[dragIndex];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      return newBlocks;
    });
  }, []);

  const addBlock = useCallback((blockType: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      ...getDefaultBlockData(blockType)
    };
    
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const duplicateBlock = useCallback((blockId: string) => {
    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(block => block.id === blockId);
      if (blockIndex === -1) return prevBlocks;
      
      const originalBlock = prevBlocks[blockIndex];
      const duplicatedBlock = {
        ...originalBlock,
        id: `block_${Date.now()}`
      };
      
      const newBlocks = [...prevBlocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      return newBlocks;
    });
  }, []);

  const handleSave = () => {
    const content = {
      blocks: blocks.map(({ id, ...block }) => block), // Remove temporary IDs
      seo: {
        title: pageSettings.seoTitle,
        description: pageSettings.seoDescription
      }
    };

    onSave({
      title: pageSettings.title,
      content: JSON.stringify(content),
      status: pageSettings.status,
      seoTitle: pageSettings.seoTitle,
      seoDescription: pageSettings.seoDescription
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-background" data-testid="page-builder">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onClose && (
              <Button variant="ghost" onClick={onClose} data-testid="button-back-to-pages">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pages
              </Button>
            )}
            <input
              type="text"
              value={pageSettings.title}
              onChange={(e) => setPageSettings(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Page title..."
              className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 placeholder-muted-foreground"
              data-testid="input-page-title"
            />
            <Badge variant={pageSettings.status === 'published' ? 'default' : 'secondary'}>
              {pageSettings.status}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'edit' | 'preview')}>
              <TabsList>
                <TabsTrigger value="edit" data-testid="tab-edit">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" data-testid="tab-preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button onClick={handleSave} disabled={isLoading} data-testid="button-save-page">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Tabs value={currentTab} className="flex-1 flex flex-col">
            {/* Edit Mode */}
            <TabsContent value="edit" className="flex-1 flex m-0">
              {/* Sidebar with block toolbar */}
              <div className="w-80 border-r border-border bg-card">
                <BlockToolbar onAddBlock={addBlock} />
              </div>

              {/* Main editing area */}
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="max-w-4xl mx-auto py-8 px-6">
                    <div className="space-y-4">
                      {blocks.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Start building your page</h3>
                          <p>Add content blocks from the sidebar to get started</p>
                        </div>
                      ) : (
                        blocks.map((block, index) => (
                          <DraggableBlock
                            key={block.id}
                            block={block}
                            index={index}
                            isSelected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onUpdate={(updates) => updateBlock(block.id, updates)}
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            moveBlock={moveBlock}
                          />
                        ))
                      )}
                      
                      {/* Add block button at bottom */}
                      <div className="flex justify-center py-8">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => addBlock('text')}
                          data-testid="button-add-block-bottom"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Block
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Preview Mode */}
            <TabsContent value="preview" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="bg-background">
                  {blocks.map((block, index) => (
                    <PreviewBlock key={block.id} block={block} />
                  ))}
                  {blocks.length === 0 && (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">No content yet</h3>
                        <p>Switch to Edit mode to add content blocks</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DndProvider>
  );
}

// Draggable Block Component
interface DraggableBlockProps {
  block: ContentBlock;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableBlock({
  block,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  moveBlock
}: DraggableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`group relative border rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-muted-foreground'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
      data-testid={`draggable-block-${block.type}-${index}`}
    >
      {/* Block controls */}
      <div className={`absolute top-2 right-2 flex items-center space-x-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <Button size="sm" variant="secondary" onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }} data-testid={`button-duplicate-block-${index}`}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="secondary" data-testid={`button-drag-block-${index}`}>
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="destructive" onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }} data-testid={`button-delete-block-${index}`}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Block content */}
      <div className="p-4">
        <EditableBlockRenderer block={block} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

// Preview Block Component
interface PreviewBlockProps {
  block: ContentBlock;
}

function PreviewBlock({ block }: PreviewBlockProps) {
  // Use the same rendering logic as the dynamic page
  return <EditableBlockRenderer block={block} onUpdate={() => {}} isPreview={true} />;
}

// Editable Block Renderer
interface EditableBlockRendererProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  isPreview?: boolean;
}

function EditableBlockRenderer({ block, onUpdate, isPreview = false }: EditableBlockRendererProps) {
  switch (block.type) {
    case 'hero':
      return <EditableHeroBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    case 'text':
      return <EditableTextBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    case 'image':
      return <EditableImageBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    case 'product':
      return <EditableProductBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    case 'testimonial':
      return <EditableTestimonialBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    case 'contact':
      return <EditableContactBlock block={block as any} onUpdate={onUpdate} isPreview={isPreview} />;
    default:
      return (
        <div className="p-4 border border-dashed border-muted-foreground rounded text-muted-foreground text-center">
          Unknown block type: {block.type}
        </div>
      );
  }
}

// Default block data factory
function getDefaultBlockData(blockType: ContentBlock['type']): Partial<ContentBlock> {
  switch (blockType) {
    case 'hero':
      return {
        title: 'Your Hero Title',
        subtitle: 'A compelling subtitle that draws attention',
        description: 'Add a description that explains your value proposition and engages your visitors.',
        buttons: [
          { text: 'Get Started', link: '#', variant: 'default' }
        ]
      };
    case 'text':
      return {
        content: '<p>Start typing your content here. You can format text, add links, and create lists.</p>',
        alignment: 'left',
        size: 'md'
      };
    case 'image':
      return {
        src: 'https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=Upload+Image',
        alt: 'Upload your image',
        caption: ''
      };
    case 'product':
      return {
        title: 'Your Product Name',
        description: 'Describe your product features and benefits here.',
        price: '$99',
        checkoutUrl: '#',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      };
    case 'testimonial':
      return {
        quote: 'This is an amazing service that exceeded all my expectations.',
        author: 'Customer Name',
        company: 'Company Name'
      };
    case 'contact':
      return {
        title: 'Get in Touch',
        description: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true }
        ]
      };
    default:
      return {};
  }
}