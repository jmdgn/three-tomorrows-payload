import React from 'react';
import TitleIntroduction from '../blocks/Titles/TitleIntroduction';

const blockComponents = {
  'titleIntroduction': TitleIntroduction,
};

const RenderBlocks = ({ blocks }) => {
  return (
    <div className="blocks-container">
      {blocks?.map((block, i) => {
        const Block = blockComponents[block.blockType];
        
        if (Block) {
          return <Block key={i} {...block} />;
        }
        
        return null;
      })}
    </div>
  );
};

export default RenderBlocks;