'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { Media, User } from '@/payload-types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getClientSideURL } from '@/utilities/getURL'
import { fields } from './fields'
import { Media as MediaComponent } from '@/components/Media'
import Image from 'next/image'
import Link from 'next/link'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
  layout?: 'standard' | 'twoColumn'
  leftContentType?: 'intro' | 'contact'
  contactInfo?: {
    heading?: string
    contacts?: Array<{
      person: User | string
      email?: string
      phone?: string
    }>
  }
  backgroundType?: 'none' | 'image' | 'color'
  enableBackgroundImage?: boolean
  backgroundImage?: {
    id: string
    url: string
  } & Media
  backgroundColor?: string
  backgroundOverlay?: 'none' | 'light' | 'dark' | 'gradient'
}

const ContactPerson: React.FC<{
  person: User
  email?: string
  phone?: string
}> = ({ person, email, phone }) => {
  const displayEmail = email || person.email

  return (
    <div className="contact-person">
      <div className="contact-person-header flex items-center gap-4 mb-4">
        {person.profileImage && typeof person.profileImage === 'object' && (
          <div className="contact-person-image w-12 h-12 rounded-full overflow-hidden">
            <MediaComponent
              resource={person.profileImage}
              imgClassName="w-full h-full object-cover"
              fill
            />
          </div>
        )}
        <div className="contact-person-info">
          <h4 className="font-semibold text-lg">{person.name || 'Contact Person'}</h4>
          <div className="contact-person-social flex gap-2 mt-1">
            {person.linkedinUrl && (
              <Link
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.3636 0H1.63636C0.732273 0 0 0.732273 0 1.63636V16.3636C0 17.2677 0.732273 18 1.63636 18H16.3636C17.2677 18 18 17.2677 18 16.3636V1.63636C18 0.732273 17.2677 0 16.3636 0ZM5.68964 14.7273H3.276V6.96109H5.68964V14.7273ZM4.45827 5.85082C3.68018 5.85082 3.051 5.22 3.051 4.44355C3.051 3.66709 3.681 3.03709 4.45827 3.03709C5.23391 3.03709 5.86473 3.66791 5.86473 4.44355C5.86473 5.22 5.23391 5.85082 4.45827 5.85082ZM14.7305 14.7273H12.3185V10.9505C12.3185 10.0497 12.3022 8.89118 11.0643 8.89118C9.80836 8.89118 9.61527 9.87218 9.61527 10.8851V14.7273H7.20327V6.96109H9.51873V8.02227H9.55145C9.87382 7.41191 10.6609 6.768 11.835 6.768C14.2789 6.768 14.7305 8.37655 14.7305 10.4678V14.7273Z"
                    fill="#0A66C2"
                  />
                </svg>
              </Link>
            )}
            {person.twitterUrl && (
              <Link
                href={person.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.7512 0H18.818L12.1179 7.62462L20 18H13.8284L8.99458 11.7074L3.46359 18H0.394938L7.5613 9.84462L0 0H6.32828L10.6976 5.75169L15.7512 0ZM14.6748 16.1723H16.3742L5.4049 1.73169H3.58133L14.6748 16.1723Z"
                    fill="black"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="contact-person-details space-y-2">
        {displayEmail && (
          <div className="contact-detail">
            <p className="text-sm text-gray-600">Email:</p>
            <a href={`mailto:${displayEmail}`} className="text-blue-600 hover:underline">
              {displayEmail}
            </a>
          </div>
        )}
        {phone && (
          <div className="contact-detail">
            <p className="text-sm text-gray-600">Phone:</p>
            <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
              {phone}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    layout = 'standard',
    leftContentType = 'intro',
    contactInfo,
    backgroundType = 'none',
    enableBackgroundImage,
    backgroundImage,
    backgroundColor,
    backgroundOverlay = 'none',
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  let containerClass =
    layout === 'twoColumn'
      ? 'form-block-container form-block-two-column container flex flex-col lg:flex-row lg:gap-12 lg:items-start'
      : 'form-block-container form-block-standard container lg:max-w-[48rem]'

  const backgroundStyle: React.CSSProperties = {}
  let overlayClass = ''
  const hasBackground = backgroundType === 'image' || backgroundType === 'color'

  // Handle background image
  if (backgroundType === 'image' && backgroundImage?.url) {
    backgroundStyle.backgroundImage = `url(${backgroundImage.url})`
    backgroundStyle.backgroundSize = 'cover'
    backgroundStyle.backgroundPosition = 'center'
    backgroundStyle.backgroundRepeat = 'no-repeat'
    backgroundStyle.position = 'relative'
  }

  // Handle background color
  if (backgroundType === 'color' && backgroundColor) {
    backgroundStyle.backgroundColor = backgroundColor
    backgroundStyle.position = 'relative'
  }

  // Handle overlay for both background types
  if (hasBackground && backgroundOverlay !== 'none') {
    overlayClass = `form-block-bg-overlay form-block-bg-overlay-${backgroundOverlay}`
  }

  // Add background classes when any background is enabled
  containerClass += hasBackground
    ? ' form-block-with-bg my-16 py-16 px-4 md:px-8 lg:px-12 rounded-2xl'
    : ''

  const FormComponent = () => (
    <div className="form-block-form-wrapper p-4 lg:p-6 border border-border rounded-[0.8rem] w-full">
      <FormProvider {...formMethods}>
        {!isLoading && hasSubmitted && confirmationType === 'message' && (
          <div className="form-block-confirmation">
            <RichText data={confirmationMessage} />
          </div>
        )}
        {isLoading && !hasSubmitted && (
          <p className="form-block-loading">Loading, please wait...</p>
        )}
        {error && (
          <div className="form-block-error">{`${error.status || '500'}: ${error.message || ''}`}</div>
        )}
        {!hasSubmitted && (
          <form id={formID} onSubmit={handleSubmit(onSubmit)} className="form-block-form">
            <div className="form-block-fields mb-4 last:mb-0">
              {formFromProps &&
                formFromProps.fields &&
                formFromProps.fields?.map((field, index) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                  if (Field) {
                    return (
                      <div
                        className={`form-block-field form-block-field-${field.blockType} mb-6 last:mb-0`}
                        key={index}
                      >
                        <Field
                          form={formFromProps}
                          {...field}
                          {...formMethods}
                          control={control}
                          errors={errors}
                          register={register}
                        />
                      </div>
                    )
                  }
                  return null
                })}
            </div>

            <Button
              form={formID}
              type="submit"
              variant="default"
              className="form-block-submit-button"
            >
              {submitButtonLabel}
            </Button>
          </form>
        )}
      </FormProvider>
    </div>
  )

  const IntroComponent = () =>
    enableIntro && introContent && !hasSubmitted ? (
      <div
        className={
          layout === 'twoColumn'
            ? 'form-block-intro form-block-intro-two-column lg:w-1/2 mb-8 lg:mb-0'
            : 'form-block-intro form-block-intro-standard mb-8 lg:mb-12'
        }
      >
        <RichText data={introContent} enableGutter={false} />
      </div>
    ) : null

  const ContactInfoComponent = () =>
    layout === 'twoColumn' && leftContentType === 'contact' && contactInfo && !hasSubmitted ? (
      <div className="form-block-contact-info lg:w-1/2 mb-8 lg:mb-0">
        <h5 className="text-2xl font-bold mb-8">
          {contactInfo.heading || 'Want to contact us directly?'}
        </h5>
        <div className="contact-persons-grid grid gap-8">
          {contactInfo.contacts?.map((contact, index) => {
            if (typeof contact.person === 'object') {
              return (
                <ContactPerson
                  key={index}
                  person={contact.person}
                  email={contact.email}
                  phone={contact.phone}
                />
              )
            }
            return null
          })}
        </div>
      </div>
    ) : null

  const Overlay = overlayClass ? <div className={overlayClass} /> : null

  if (layout === 'twoColumn') {
    return (
      <div className={containerClass} style={backgroundStyle}>
        {Overlay}
        <div className="form-block-content relative z-10 flex flex-col lg:flex-row w-full lg:gap-12 lg:items-start">
          {leftContentType === 'intro' ? <IntroComponent /> : <ContactInfoComponent />}
          <div className="form-block-form-column lg:w-1/2">
            <FormComponent />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass} style={backgroundStyle}>
      {Overlay}
      <div className="form-block-content relative z-10">
        <IntroComponent />
        <FormComponent />
      </div>
    </div>
  )
}
