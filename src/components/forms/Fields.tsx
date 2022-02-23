import { FormHelperText, TextField } from "@mui/material"
import { Fragment, HTMLInputTypeAttribute } from "react"
import { useFormikContext } from "formik";

export interface IFieldsProps {
    fields: {
        label: string,
        name: string,
        type?: HTMLInputTypeAttribute
        multiline?: boolean
    }[]
}

export const Fields: React.FC<IFieldsProps> = ({ fields }) => {
    const { errors, touched, values, handleChange } = useFormikContext<any>();

    return <>
        {
            fields.map((field) => (
                <Fragment key={field.name}>
                    <TextField
                        name={field.name}
                        label={field.label}
                        value={values[field.name]}
                        onChange={handleChange}
                        type={field.type}
                        multiline={field.multiline}
                        sx={{ mt: 2, mb: 1, width: '100%' }}
                    />

                    <FormHelperText sx={{ mb: 2, width: '100%' }} error>
                        {touched[field.name] && errors[field.name]}
                    </FormHelperText>
                </Fragment>
            )
            )
        }
    </>
}
