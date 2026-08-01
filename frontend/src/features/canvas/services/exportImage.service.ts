import { toPng } from 'html-to-image';
import { getNodesBounds, type Node } from '@xyflow/react';
import { Toast } from '@/shared/stores/toast.store';

export async function downloadImage(nodes: Node[], projectName: string = 'schema') {
  if (nodes.length === 0) {
    Toast.error('No nodes to export!');
    return;
  }

  // Find the viewport element
  const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!flowElement) {
    Toast.error('Could not find canvas element.');
    return;
  }

  Toast.info('Preparing image...', 1500);

  try {
    // Determine bounds
    const nodesBounds = getNodesBounds(nodes);
    
    // Calculate required width and height adding some padding
    const padding = 60;
    const width = nodesBounds.width + padding * 2;
    const height = nodesBounds.height + padding * 2;

    const dataUrl = await toPng(flowElement, {
      backgroundColor: 'transparent',
      width: width,
      height: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${padding - nodesBounds.x}px, ${padding - nodesBounds.y}px) scale(1)`,
      },
      pixelRatio: 2, // High resolution
    });

    const link = document.createElement('a');
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-schema.png`;
    link.href = dataUrl;
    link.click();
    
    Toast.success('Image downloaded successfully!');
  } catch (error) {
    console.error('Error generating image', error);
    Toast.error('Failed to generate image.');
  }
}
