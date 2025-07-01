import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import TitleIntroduction from '@/blocks/Titles/TitleIntroduction'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CardStackBlock } from '@/blocks/CardStack'
import { ContactCTABlock } from '@/blocks/ContactCTA'
import { TabbedPanelBlock } from '@/blocks/TabbedPanel'
import { ExpertiseBlock } from '@/blocks/ExpertiseBlock'
import { AboutIntroBlock } from '@/blocks/AboutIntroBlock'

const blockComponents = {
  titleIntroduction: TitleIntroduction,
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  cardStack: CardStackBlock,
  contactCTA: ContactCTABlock,
  tabbedPanel: TabbedPanelBlock,
  expertiseBlock: ExpertiseBlock,
  aboutIntroBlock: AboutIntroBlock,
}

const fullWidthBlocks = ['expertiseBlock', 'aboutIntroBlock']

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              if (fullWidthBlocks.includes(blockType)) {
                return (
                  <div key={index}>
                    <Block {...block} />
                  </div>
                )
              }

              return (
                <div className="my-16" key={index}>
                  <div className="blockInner">
                    <Block {...block} disableInnerContainer />
                  </div>
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
