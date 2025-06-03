import { Field } from 'payload'

// Add placeholder field to text-based field types
const placeholderField: Field = {
  name: 'placeholder',
  type: 'text',
  label: 'Placeholder Text',
  admin: {
    description: 'Optional placeholder text that appears in the empty field',
  },
}

// Extended field configurations that include placeholder
export const customFormFields = {
  text: {
    label: 'Text',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      placeholderField,
      {
        name: 'defaultValue',
        type: 'text',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  email: {
    label: 'Email',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      placeholderField,
      {
        name: 'defaultValue',
        type: 'text',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  textarea: {
    label: 'Textarea',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      placeholderField,
      {
        name: 'defaultValue',
        type: 'textarea',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'rows',
        type: 'number',
        label: 'Rows',
        defaultValue: 3,
        min: 1,
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  number: {
    label: 'Number',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      placeholderField,
      {
        name: 'defaultValue',
        type: 'number',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
}
