import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { AboutIntroBlock } from '@/blocks/AboutIntroBlock'
import { AccordionBlock } from '@/blocks/AccordionBlock'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AuroraFeatureBlock } from '@/blocks/AuroraFeature'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardStackBlock } from '@/blocks/CardStack'
import { ContactCTABlock } from '@/blocks/ContactCTA'
import { ContentBlock } from '@/blocks/Content/Component'
import { ExpertiseBlock } from '@/blocks/ExpertiseBlock'
import { ExpertiseGridBlock } from '@/blocks/ExpertiseGrid'
import { FormBlock } from '@/blocks/Form/Component'
import { HeaderSectionBlock } from '@/blocks/HeaderSection'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { OurServicesIntroBlock } from '@/blocks/OurServicesIntro'
import { ServiceLinkPanelsBlock } from '@/blocks/ServiceLinkPanelsBlock'
import { TabbedPanelBlock } from '@/blocks/TabbedPanel'
import TitleIntroduction from '@/blocks/Titles/TitleIntroduction'

const blockComponents = {
  accordionBlock: AccordionBlock,
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
  headerSection: HeaderSectionBlock,
  expertiseGrid: ExpertiseGridBlock,
  ourServicesIntro: OurServicesIntroBlock,
  auroraFeature: AuroraFeatureBlock,
  serviceLinkPanels: ServiceLinkPanelsBlock,
}

const fullWidthBlocks = ['expertiseBlock', 'aboutIntroBlock', 'auroraFeature']

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
                    {/* @ts-expect-error */}
                    <Block {...block} />
                  </div>
                )
              }

              return (
                <div className="my-16" key={index}>
                  <div className="blockInner">
                    {/* @ts-expect-error */}
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
