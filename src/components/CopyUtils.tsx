import { ButtonBase, BoxProps } from "@mui/material";
import { useSnackbar } from "notistack";

export const CopyableContent: React.FC<{ children: string, sx: BoxProps['sx'] }> = ({ children, sx }) => {
    const { enqueueSnackbar } = useSnackbar();

    return <ButtonBase onClick={() => {
        navigator.clipboard.writeText(children);
        enqueueSnackbar('Copied to clipboard!');
    }} sx={sx}>
        {children}
    </ButtonBase>
}
