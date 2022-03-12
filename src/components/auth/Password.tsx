import { Box, Button, Container, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { Fields } from "../forms/Fields";

export interface PasswordProps {
    onSubmit: (password: string) => void
}

export const Password: React.FC<PasswordProps> = ({ onSubmit }) => {
    return <Container sx={{ width: '100vw', py: 20 }}>
        <Box width={'100%'} maxWidth={'40rem'} mx='auto'>

            <Typography variant='h3' sx={{ mb: 6 }}>
                Enter your wallet password
            </Typography>

            <Formik
                initialValues={{ password: '' }}
                validationSchema={yup.object({
                    password: yup.string().required('Password is required')
                })}
                onSubmit={async (values) => {
                    onSubmit(values.password);
                }}
            >
                <Form style={{ width: '100%' }}>
                    <Fields fields={[
                        {
                            label: 'Password',
                            name: 'password',
                            type: 'password'
                        }
                    ]} />

                    <Box display='flex'>
                        <Button type='submit' variant='contained' color='primary'
                            sx={{ ml: 'auto' }}>
                            Continue
                        </Button>
                    </Box>
                </Form>
            </Formik>
        </Box>
    </Container>;
}
