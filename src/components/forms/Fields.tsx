import { FormHelperText, TextField, TextFieldProps } from "@mui/material"
import { Fragment, HTMLInputTypeAttribute } from "react"
import { useFormikContext } from "formik";

export interface IFieldsProps {
    fields: {
        label: string,
        name: string,
        type?: HTMLInputTypeAttribute | 'amount'
        multiline?: boolean
    }[]
}

export const Fields: React.FC<IFieldsProps> = ({ fields }) => {
    const { errors, values, handleChange, handleBlur } = useFormikContext<any>();

    return <>
        {
            fields.map((field) => (
                <Fragment key={field.name}>
                    {
                        (
                            ({
                                amount: (
                                    <AmountField
                                        name={field.name}
                                        label={field.label}
                                        sx={{ mt: 2, mb: 1, width: '100%' }}
                                    />
                                )
                            } as any)[field.type ?? 'any']
                        ) ?? (
                            <TextField
                                name={field.name}
                                label={field.label}
                                value={values[field.name]}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                type={field.type}
                                multiline={field.multiline}
                                sx={{ mt: 2, mb: 1, width: '100%' }}
                            />
                        )
                    }

                    <FormHelperText sx={{ mb: 2, width: '100%' }} error>
                        {errors[field.name]}
                    </FormHelperText>
                </Fragment>
            )
            )
        }
    </>
}

function format(value: string | number) {
    if ((value as string).charAt) {
        value = Number.parseFloat(value as string);
    }

    if (Number.isNaN(value)) return '';

    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 })
        .format(value as number);
}

const AmountField: React.FC<TextFieldProps & { name: string }> = ({ name, ...rest }) => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext<any>();
    const formattedField = `${name}__formatted`;

    return <TextField
        {...rest}
        name={name}
        value={values[formattedField] ?? format(values[name])}
        onChange={(e) => {
            const value = e.target.value;
            const regex = /^([0-9]+(\.)[0-9]*)$|^([0-9]*)$/g;

            if (!regex.test(value)) return;

            setFieldValue(formattedField, value);
            setFieldValue(name, Number.parseFloat(value));
        }}
        onBlur={(e) => {
            setFieldValue(formattedField, format(e.target.value));
            setFieldTouched(name, true);
        }}
    />
}
