import React from 'react'
import { Service } from '../../payload-types'
import { Card } from '../ui/card'
import { Media } from '../Media'

type Props = {
  services: Service[]
}

export const ServicesComponent: React.FC<Props> = ({ services }) => {
  return (
    <section className="service-panel">
      <div className="serviceContent-outer">
        <div className="serviceContent-inner">
          <div className="titleText center">
            <div className="txtContent-container">
              <h3 className="animate-title">Our Services</h3>
              <p>Our services form a natural progression from understanding to action:</p>
            </div>
          </div>

          <div className="serviceGrid-container">
            {services.map((service) => (
              <div key={service.id} className="servicePanel-container">
                <Card className="serviceCard">
                  {service.image && (
                    <div className="serviceFt-image">
                      <Media resource={service.image} className="service-image" />
                    </div>
                  )}
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                </Card>
              </div>
            ))}
          </div>

          <div className="btnFrame center">
            <div className="txtContent-container">
              <a className="contactCta header" href="#">
                Book a Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
