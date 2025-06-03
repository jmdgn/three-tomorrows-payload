'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { Media } from '@/payload-types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getClientSideURL } from '@/utilities/getURL'
import { fields } from './fields'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
  layout?: 'standard' | 'twoColumn'
  backgroundType?: 'none' | 'image' | 'color'
  enableBackgroundImage?: boolean
  backgroundImage?: {
    id: string
    url: string
  } & Media
  backgroundColor?: string
  backgroundOverlay?: 'none' | 'light' | 'dark' | 'gradient'
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

  const Overlay = overlayClass ? <div className={overlayClass} /> : null

  if (layout === 'twoColumn') {
    return (
      <div className={containerClass} style={backgroundStyle}>
        {Overlay}
        <div className="form-block-content relative z-10 flex flex-col lg:flex-row w-full lg:gap-12 lg:items-start">
          <IntroComponent />
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
